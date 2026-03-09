import { useEffect, useRef } from "react";
import type { Message } from "../types";
import MessageBubble from "./MessageBubble";

interface ChatPanelProps {
    messages: Message[],
    activeTool: string | null,
    isWaitingForResponse: boolean
}


export default function ChatPanel({ messages, activeTool, isWaitingForResponse }: ChatPanelProps) {

    const ref = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div  style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {messages?.length === 0 ? <div> Type to start </div> : messages.map(message => <MessageBubble key={message.id} message={message} />)}
            {isWaitingForResponse && (
                <div>
                    {activeTool ? `▶ calling ${activeTool}...` : '▶ agent thinking...'}
                </div>
            )}
            <div ref={ref} />
        </div>
    )
}