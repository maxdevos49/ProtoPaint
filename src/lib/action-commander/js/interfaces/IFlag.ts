export interface IFlag {
    name: string;
    description?: string;
    type: (...args: any[]) => String | Number | Boolean | Array<string>;
    parameterIndex: number;
    suggestionKey?: string;
}