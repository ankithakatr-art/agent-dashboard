import { useEffect, useState } from "react";
import { TOOLS } from "../constants";

export interface HeaderProps {
    activeTool: string | null;
}

export default function Header({ activeTool }: HeaderProps) {

    const [clock, setClock] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setClock(new Date()), 1000)
        return () => clearInterval(timer);
    }, []);

    const clockStr = clock.toLocaleTimeString('en-US', { hour12: false });

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 20px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-panel)'
        }}>
            <div style={{ display: 'flex', gap: '6px' }}>
                {/* three colored dots */}
                <span style={{
                    backgroundColor: '#ff3b30',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    display: 'inline-block'
                }} />
                <span style={{
                    backgroundColor: '#ffcc00',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    display: 'inline-block'
                }} />
                <span style={{
                    backgroundColor: '#28c840',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    display: 'inline-block'
                }} />
                <span style={{ color: 'var(--green)', fontWeight: 700, letterSpacing: '0.1em' }}>
                    AGENT_DASHBOARD
                </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                {TOOLS.map(tool => (
                    <span key={tool.name} style={{
                        padding: '2px 8px',
                        border: `1px solid ${activeTool === tool.name ? 'var(--green)' : 'var(--border)'}`,
                        color: activeTool === tool.name ? 'var(--green)' : 'var(--white-dim)',
                        fontSize: '11px',
                    }}>
                        {tool.label}
                    </span>
                ))}
            </div>

            <div>{clockStr}</div>
        </header>
    );
}