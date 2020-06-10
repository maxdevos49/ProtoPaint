import { IFlag } from "./IFlag.js";
import { IActionBinding } from "./IActionBinding.js";

export interface IAction {
    name: string,
    methodKey: string | symbol;
    summary: string;
    description?: string;
    variations?: Array<IActionBinding>;
    flags?: Map<string, IFlag>;
}