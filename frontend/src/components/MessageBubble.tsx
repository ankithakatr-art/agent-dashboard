import type { Message } from '../types';

interface MessageBubbleProps {
    message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const timeStr = message.timestamp.toLocaleTimeString('en-US', { 
        hour12: false 
    });

    const isUser = message.origin === 'user';
    const isError = message.origin === 'error';

    const labelColor = isUser ? 'var(--green)' : isError ? 'var(--red)' : 'var(--blue)';
    const textColor = isUser ? 'var(--green)' : isError ? 'var(--red)' : 'var(--white-dim)';
    const label = isUser ? '❯ YOU' : isError ? '✗ ERROR' : '◆ AGENT';

    return (
        <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(0,255,65,0.05)' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                <span style={{ color: labelColor, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' }}>
                    {label}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px' }}>
                    {timeStr}
                </span>
            </div>
            <div style={{ color: textColor, paddingLeft: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {message.text}
            </div>
        </div>
    );
}