export = LineByLineReader

declare class LineByLineReader {
    public constructor(csv: string, options: { skipEmptyLines: boolean })

    public on(event: 'error' | 'line' | 'end', handler: (data: any) => void): void

    public pause(): void

    public resume(): void

    public close(): void
}



