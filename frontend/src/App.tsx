import { useState } from "react";
import type { Message, ToolActivity } from "./types";
import Header from "./components/Header";
import ChatPanel from "./components/ChatPanel";
import InputBar from "./components/InputBar";
import ActivityPanel from "./components/ActivityPanel";

export default function App() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [toolActivity, setToolActivity] = useState<ToolActivity[]>([]);
    const [isWaitingForResponse, setWaitingForResponse] = useState<boolean>(false);
    const [activeTool, setActiveTool] = useState<string | null>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';

    const sendMessage = (text: string) => {
        setWaitingForResponse(true);
        setMessages(prev => [...prev, { origin: 'user', text: text, id: crypto.randomUUID(), timestamp: new Date() }]);

        fetch(`${API_URL}/agent/query`, {
            method: 'POST',
            body: JSON.stringify({ "message": text }),
            headers: {
                "Content-Type": "application/json",
            },
        }).then(response => response.json())
            .then(res => {
                setMessages(prev => [...prev, { origin: 'agent', text: res.reply, id: crypto.randomUUID(), timestamp: new Date() }]);
                setToolActivity(prev => [
                    ...prev,
                    ...res.toolActivity.map((a: any) => ({
                        ...a,
                        id: crypto.randomUUID(),
                        timestamp: new Date()
                    }))
                ]);
                if (res.toolActivity.length > 0) {
                    const lastTool = res.toolActivity[res.toolActivity.length - 1].tool;
                    setActiveTool(lastTool);
                    setTimeout(() => setActiveTool(null), 1500);
                }
            })
            .catch(() => {
                setMessages(prev => [...prev, {
                    origin: 'error',
                    text: 'Failed to get response. Please try again.',
                    id: crypto.randomUUID(),
                    timestamp: new Date()
                }]);
            })
            .finally(() => setWaitingForResponse(false));
    };


    return <div>
        <Header activeTool={activeTool}/>
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ChatPanel messages={messages} activeTool={activeTool} isWaitingForResponse={isWaitingForResponse}/>
        <ActivityPanel activities={toolActivity} />
        </div>
        <InputBar onSend={sendMessage} isWaitingForResponse={isWaitingForResponse} />
    </div>;

}

