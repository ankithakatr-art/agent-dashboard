import type { ToolActivity } from "../types";

interface ActivityPanelProps {
    activities: ToolActivity[];
}

export default function ActivityPanel({ activities }: ActivityPanelProps) {

    return (
        <div style={{
            width: '320px',
            flexShrink: 0,
            borderLeft: '1px solid var(--border)',
            overflowY: 'auto',
            padding: '12px',
            background: 'var(--bg-panel)'
        }}>
            {activities.map(activity => (
                <div key={activity.id} style={{
                    borderLeft: '2px solid var(--green)',
                    padding: '8px 10px',
                    marginBottom: '8px',
                    background: 'var(--green-faint)',
                    fontSize: '11px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 700 }}>
                            {activity.tool.toUpperCase()}
                        </span>
                        <span style={{ color: 'var(--amber)' }}>{activity.duration}</span>
                    </div>
                    <div style={{ color: 'var(--white-dim)' }}>
                        {JSON.stringify(activity.args)}
                    </div>
                </div>
            ))}
        </div>
    );

}