import { IActionCommander } from "../ActionCommander.js";
import { IParsedCommmand } from "./IParsedCommand.js";

export interface IActionExtension {

    init(): void;

    onInput?(event: KeyboardEvent): void;
    onChange?(): void;
    onSubmit?(parsedCommand: IParsedCommmand): void;

    onExecution?(parsedCommand: IParsedCommmand): void;
    onExecutionCancel?(parsedCommand: IParsedCommmand): void;
    onSuccess?(parsedCommand: IParsedCommmand): void;
    onError?(parsedCommand: IParsedCommmand): void;
    onFocus?(): void;
    onBlur?(): void;

}

export interface IActionExtensionConstructor<T extends IActionExtension> {
    new(actionCommander: IActionCommander, ...args: any[]): T
}