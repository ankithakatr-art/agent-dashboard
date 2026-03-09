# AI Agent Dashboard

A full-stack AI agent application with a terminal-aesthetic dashboard. Ask questions in natural language — the agent intelligently selects and calls the right tools to answer, showing its reasoning and tool activity in real time.

**Live Demo:** [agent-dashboard-1-n1wl.onrender.com](https://agent-dashboard-1-n1wl.onrender.com)

---

## What It Does

The agent receives a user message and decides which tools to call — or chains multiple tool calls — to produce an accurate response. Every tool call is logged in the activity panel with the arguments passed, result returned, and execution time.

**Available Tools:**
- **DateTime** — returns the current date and time
- **Calculator** — evaluates mathematical expressions using mathjs
- **Air Quality** — fetches real-time AQI data for any city via OpenWeatherMap
- **Currency Converter** — converts amounts between currencies via open.er-api.com
- **Resume Search** — semantic search over resume data using OpenAI embeddings + Pinecone

---

## Tech Stack

**Frontend**
- React + TypeScript
- Vite
- CSS Variables (terminal/hacker aesthetic)

**Backend**
- Node.js + Express
- OpenAI API (GPT-3.5-turbo + text-embedding-ada-002)
- Pinecone Vector Database
- OpenWeatherMap API
- open.er-api.com

---

## Architecture

```
User Message
     │
     ▼
Express /agent/query
     │
     ▼
runAgent() — agent loop
     │
     ├── OpenAI GPT-3.5 decides which tool to call
     │
     ├── Tool executes (datetime / calculator / air quality / currency / resume)
     │
     ├── Result returned to OpenAI
     │
     └── OpenAI generates final response
          │
          ▼
     { reply, toolActivity[] }
          │
          ▼
     React Frontend
     ├── Chat Panel — displays conversation
     └── Activity Panel — shows tool calls, args, results, duration
```

The agent loop runs until OpenAI returns `finish_reason: stop`. If multiple tools are needed, the loop continues automatically.

---

## Running Locally

**Prerequisites:** Node.js, pnpm, OpenAI API key, Pinecone account, OpenWeatherMap API key

**Clone the repo**
```bash
git clone https://github.com/ankithakatr-art/agent-dashboard
cd agent-dashboard
```

**Server setup**
```bash
cd server
pnpm install
```

Create `server/.env`:
```
OPENAI_API_KEY=your_key_here
WEATHER_API_KEY=your_key_here
PINECONE_API_KEY=your_key_here
PINECONE_INDEX=your_index_name
PORT=5005
```

```bash
node index.js
```

**Frontend setup**
```bash
cd frontend
pnpm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5005
```

```bash
pnpm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Key Implementation Details

**Agent Loop**
The core of the application is a `while(true)` loop that continues calling OpenAI until it returns `finish_reason: stop`. This allows the agent to chain multiple tool calls in a single response.

```javascript
while (true) {
    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        tools,
        tool_choice: 'auto'
    });

    if (finish_reason === 'stop') return { answer, toolActivity };
    if (finish_reason === 'tool_calls') {
        // execute tools, push results back to messages
    }
}
```

**Tool Activity Tracking**
Every tool call is timed and recorded:
```javascript
const startTime = Date.now();
const result = await executeTool();
toolActivity.push({
    tool: toolName,
    args,
    result,
    duration: `${Date.now() - startTime}ms`
});
```

**Resume Search**
Uses the same RAG pattern from [Project 1](https://github.com/ankithakatr-art/rag-resume-bot) — user query is embedded with `text-embedding-ada-002`, then queried against a Pinecone index containing resume chunks.

---

## What I Learned

- How OpenAI function calling works under the hood — the agent loop, tool result format, and why `tool_choice: "auto"` matters over `"required"`
- Multi-tool chaining — the model can call multiple tools in sequence within a single user request
- Reusing patterns across projects — the Pinecone + embeddings logic from Project 1 was adapted directly into a tool here
- Debugging async tool execution — tracking down why `messages.push()` needed to be outside the for loop
- Production deployment of a monorepo with separate server and static site services

---

## Project Series

This is Project 2 in an AI engineering learning series:

| Project | Description | Live |
|---------|-------------|------|
| [RAG Resume Bot](https://github.com/ankithakatr-art/rag-resume-bot) | Semantic search chatbot over resume data using RAG | [Live](https://rag-resume-bot-u0c3.onrender.com) |
| **AI Agent Dashboard** | Multi-tool AI agent with real-time activity feed | [Live](https://agent-dashboard-1-n1wl.onrender.com) |
| Project 3 | Production-grade RAG with PDF upload, caching, evaluation | Coming soon |