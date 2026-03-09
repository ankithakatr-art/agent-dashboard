import { useState } from "react";

interface InputBarProps {
    onSend: (text: string) => void;
    isWaitingForResponse: boolean
}

export default function InputBar({ onSend, isWaitingForResponse }: InputBarProps) {

    const [inputText, setInputText] = useState<string>('');

    const handleSend = () => {
        if (inputText.trim().length === 0 || isWaitingForResponse) return;
        onSend(inputText.trim());
        setInputText('');

    };
return (
    <div style={{
        borderTop: '1px solid var(--border)',
        padding: '12px 16px',
        background: 'var(--bg-panel)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    }}>
        <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '14px' }}>
            {isWaitingForResponse ? '⟳' : '❯'}
        </span>
        <input
            type="text"
            disabled={isWaitingForResponse}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            value={inputText}
            placeholder="ask the agent anything..."
            style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--green)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                caretColor: 'var(--green)',
            }}
        />
        <button
            disabled={isWaitingForResponse || inputText.length === 0}
            onClick={handleSend}
            style={{
                background: 'transparent',
                border: '1px solid var(--green)',
                color: 'var(--green)',
                padding: '4px 14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                cursor: 'pointer',
                letterSpacing: '0.1em',
                fontWeight: 700,
            }}
        >
            SEND
        </button>
    </div>
);
}