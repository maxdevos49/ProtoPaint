import { IActionCommander } from "../ActionCommander.js";
import { IParsedCommand } from "./IParsedCommand.js";

export interface IActionExtension {

    init(): void;

    onInput?(event: KeyboardEvent): void;
    onChange?(): void;
    onSubmit?(parsedCommand: IParsedCommand): void;

    onExecution?(parsedCommand: IParsedCommand): void;
    onExecutionCancel?(parsedCommand: IParsedCommand): void;
    onSuccess?(parsedCommand: IParsedCommand): void;
    onError?(parsedCommand: IParsedCommand): void;
    onFocus?(): void;
    onBlur?(): void;

}

export interface IActionExtensionConstructor<T extends IActionExtension> {
    new(actionCommander: IActionCommander, ...args: any[]): T
}