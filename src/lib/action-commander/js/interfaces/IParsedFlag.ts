import { IFlag } from "./IFlag";

export interface IParsedFlag {
    key: string;
    value: string;
    flagMetaData: IFlag | null;
}