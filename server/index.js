const express = require("express");
const cors = require('cors');
require('dotenv').config();
const { OpenAI } = require('openai');
const { create, all } = require('mathjs');
const math = create(all);
const { Pinecone } = require('@pinecone-database/pinecone');


const app = express();
app.use(cors());
app.use(express.json());


const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


app.use((req, res, next) => {
    console.log("Incoming request:", req.method, req.url);
    next();
});

app.post("/agent/query", async (request, response) => {
    try {
        const userMessage = request.body.message;

        const { answer, toolActivity } = await runAgent(userMessage);

        response.json({ reply: answer, toolActivity });

    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Agent failed" });
    }
});

const tools = [{
    type: "function",
    function: {
        name: "get_current_datetime",
        description: "Gets current date and time",
        parameters: {
            type: "object",
            properties: {}
        }
    }
}, {
    type: "function",
    function: {
        name: "calculator",
        description: "Perform mathematical operations",
        parameters: {
            type: "object",
            properties: {
                expression: {
                    type: "string",
                    description: "the mathematical expression to evaluate e.g. '2 + 2'"
                }
            },
            required: ["expression"]
        }
    }
},
{
    type: "function",
    function: {
        name: "get_air_quality",
        description: "Use this when someone asks about air quality, pollution levels, or whether it's safe to go outside in a city",
        parameters: {
            type: "object",
            properties: {
                city: {
                    type: "string",
                    description: "The name of the city e.g. 'Delhi' or 'Mumbai"
                }
            },
            required: ["city"]
        }
    }
},
{
    type: "function",
    function: {
        name: "currency_converter",
        description: "Use this when someone asks about converting a currency amount from one to another",
        parameters: {
            type: "object",
            properties: {
                currency_amount: {
                    type: "string",
                    description: "The amount to be converted e.g. 300, 450"
                },
                from: {
                    type: "string",
                    description: "The currency to convert from e.g. USD"
                },
                to: {
                    type: "string",
                    description: "The currency to convert to e.g. EUR"
                }
            },
            required: ["currency_amount", "from", "to"]
        }
    }
},
{
    type: "function",
    function: {
        name: "search_resume",
        description: "Use this when someone asks about Ankitha's work experience from her resume",
        parameters: {
            type: "object",
            properties: {
                question: {
                    type: "string",
                    description: "The input question from the user"
                }
            },
            required: ["question"]
        }
    }
}
];

function getCurrentDatetime() {
    return new Date().toString();
}

function calculator(expression) {
    return math.evaluate(expression);
}

async function currencyConverter(currency, from, to) {
    const response = await fetch(`https://open.er-api.com/v6/latest/${from}`)
    const data = await response.json();
    const rate = data.rates[to];
    console.log('data.rates[to]---', data.rates[to]);
    console.log('amount---', currency, 'from---', from, 'to---', to);

    return {
        original: `${currency} ${from}`,
        converted: `${(currency * rate).toFixed(2)} ${to}`,
        rate
    };
}

async function getAirQuality(city) {
    const geocoding = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.WEATHER_API_KEY}`)


    const data = await geocoding.json();

    const lat = data[0].lat, lon = data[0].lon;

    console.log(lat, lon)
    const aqiResponse = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}`)
    const aqiData = await aqiResponse.json();

    return {
        city,
        aqi: aqiData.list[0].main.aqi,
        components: aqiData.list[0].components

    }
}

async function searchResume(question) {
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    });

    const embedding = await client.embeddings.create({
        model: "text-embedding-ada-002",
        input: question
    });

    const index = pinecone.index('resume-index');
    const stats = await index.describeIndexStats();
    console.log('Pinecone connected! Total vectors:', stats.totalRecordCount);

    const searchResults = await index.query({
        vector: embedding.data[0].embedding,
        topK: 10,
        includeMetadata: true
    });

    const context = searchResults.matches
        .map(match => match.metadata.text)
        .join('\n\n');

    return { question, context };
}

async function runAgent(userMessage) {

    let toolActivity = [];
    const messages = [
        { role: "system", content: "You are a helpful personal assistant with access to tools for datetime, calculations, weather, and resume search." },
        { role: "user", content: userMessage }
    ];

    while (true) {
        const completion = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages,
            tools,
            tool_choice: "auto"
        });

        if (completion.choices[0].finish_reason === 'stop') {
            return {
                answer: completion.choices[0].message.content,
                toolActivity
            }
        } else if (completion.choices[0].finish_reason === 'tool_calls') {
            const choice = completion.choices[0];
            messages.push(choice.message);

            for (const toolCall of choice.message.tool_calls) {

                const selection = toolCall.function.name;

                switch (selection) {
                    case 'get_current_datetime':

                        {
                            const startTime = Date.now();
                            const result = getCurrentDatetime();
                            const duration = Date.now() - startTime;


                            toolActivity.push({
                                tool: 'get_current_datetime',
                                args,
                                result,
                                duration: `${duration}ms`
                            });

                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ datetime: result })
                            });
                        }

                        break;
                    case 'calculator':
                        {
                            const args = JSON.parse(toolCall.function.arguments);
                            const startTime = Date.now();
                            const result = calculator(args.expression);
                            const duration = Date.now() - startTime;

                            toolActivity.push({
                                tool: 'calculator',
                                args,
                                result,
                                duration: `${duration}ms`
                            });

                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ datetime: result })
                            });
                        }
                        break;
                    case 'get_air_quality':
                        {
                            const args = JSON.parse(toolCall.function.arguments);
                            const startTime = Date.now();
                            const result = await getAirQuality(args.city);
                            const duration = Date.now() - startTime;

                            toolActivity.push({
                                tool: 'get_air_quality',
                                args,
                                result,
                                duration: `${duration}ms`
                            });

                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ air_quality: result })
                            })
                        }
                        break;
                    case 'currency_converter':
                        {
                            const args = JSON.parse(toolCall.function.arguments);
                            const startTime = Date.now();
                            const result = await currencyConverter(args.currency_amount, args.from, args.to);
                            const duration = Date.now() - startTime;

                            toolActivity.push({
                                tool: 'currency_converter',
                                args,
                                result,
                                duration: `${duration}ms`
                            });

                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ currency: result })
                            })
                        }
                        break;
                    case 'search_resume':
                        {
                            const args = JSON.parse(toolCall.function.arguments);
                            const startTime = Date.now();
                            const result = await searchResume(args.question);
                            const duration = Date.now() - startTime;

                            toolActivity.push({
                                tool: 'search_resume',
                                args,
                                result,
                                duration: `${duration}ms`
                            });

                            messages.push({
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({ question: result })
                            });
                        }
                        break;
                    default:
                        console.error('Invalid agent tool')

                }
            }
        }

    }
}


app.listen(process.env.PORT || 5005, () => {
    console.log("Server running on ---", process.env.PORT || 5005);
});