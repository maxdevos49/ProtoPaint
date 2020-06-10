import { IAction } from "./IAction.js";

export interface IActionController {
    name: string,
    summary: string;
    description?: string;
    controller?: any;
    actions?: Map<string, IAction>;
}