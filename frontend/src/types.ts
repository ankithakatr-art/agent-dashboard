export interface Message {
    id: string,
    text: string,
    origin: 'user' | 'agent' | 'error',
    timestamp: Date
};

export interface ToolActivity{
    id: string,
    tool: string,
    args: Record<string, unknown>,
    result: unknown,
    duration: string,
    timestamp: Date
}