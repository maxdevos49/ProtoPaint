import { IActionController } from "./IActionController.js";
import { IAction } from "./IAction.js";
import { IParsedFlag } from "./IParsedFlag.js";

export interface IParsedCommand {
    command: string;
    searchKey: string;
    splitCommand: string[]

    isValid: boolean;
    errors: string[];

    controller: string;
    controllerMetaData: IActionController | null;

    action: string;
    actionMetaData: IAction | null;

    currentFlag: IParsedFlag;
    // parsingFlag: boolean;

    rawValues: Map<string, string>;
    actionArguments: any[];

    cancelExecution: boolean;
}