import { IParsedCommand } from "../interfaces/IParsedCommand.js";
import { IActionController } from "../interfaces/IActionController.js";

export class CommandParser {

    public static parse(command: string, controllers: Map<string, IActionController>): IParsedCommand {


        let parsedCommand: IParsedCommand = {
            command: command,
            searchKey: "",
            splitCommand: [],

            isValid: false,
            errors: [],

            controller: "",
            controllerMetaData: null,

            action: "",
            actionMetaData: null,

            currentFlag: null,

            rawValues: new Map<string, string>(),
            actionArguments: [],

            cancelExecution: false,
        }

        this.splitCommand(parsedCommand);
        this.processSplitCommand(parsedCommand, controllers);

        if (parsedCommand.errors.length > 0)
            parsedCommand.isValid = false;
        else
            parsedCommand.isValid = true;

        return parsedCommand;
    }

    private static processSplitCommand(parsedCommand: IParsedCommand, controllers: Map<string, IActionController>): void {
        //parse controller
        let controller = parsedCommand.splitCommand.shift();
        if (!controllers.has(controller)) {
            parsedCommand.errors.push(`The controller: "${controller}" does not exist.`);
            return;
        }

        parsedCommand.controller = controller;
        parsedCommand.controllerMetaData = controllers.get(controller);


        //parse action
        let action = parsedCommand.splitCommand.shift();
        if (!parsedCommand.controllerMetaData?.actions?.has(action)) {
            parsedCommand.errors.push(`The action: "${action}" does not exist on the controller: ${controller}.`);
            return;
        }

        parsedCommand.action = action;
        parsedCommand.actionMetaData = parsedCommand.controllerMetaData.actions?.get(action);


        //parse flags
        while (parsedCommand.splitCommand.length > 0) {

            parsedCommand.currentFlag = null;

            //value === undefined if no value yet
            let [key, value] = parsedCommand.splitCommand.shift().split("=");
            parsedCommand.rawValues.set(key, value);

            //use the correct search key for either value or flag key
            parsedCommand.searchKey = (value !== undefined) ? value : key;

            if (!parsedCommand.actionMetaData?.flags?.has(key)) {
                parsedCommand.errors.push(`The flag with the key: "${key}" does not exist for the action: "${action}"`);
                return;
            }

            parsedCommand.currentFlag = {
                key: key,
                value: value,
                flagMetaData: parsedCommand.actionMetaData?.flags?.get(key)
            }

            //parse and assign value to action argument array
            let index = parsedCommand.currentFlag.flagMetaData.parameterIndex;
            let parsedValue = this.ParseToType(parsedCommand.currentFlag.flagMetaData.type, value);
            parsedCommand.actionArguments[index] = parsedValue;

        }

        //clear search key if there is a trailing space
        if (parsedCommand.command[parsedCommand.command.length - 1] === " ") {
            parsedCommand.searchKey = "";
            parsedCommand.currentFlag = null;
        }
    }

    private static splitCommand(parsedCommand: IParsedCommand): void {

        let index = 0;
        let insideSingleQuote = false;
        let insideDoubleQuote = false;
        let insideSquareBracket = false;

        while (index < parsedCommand.command.length) {

            let char = parsedCommand.command[index];

            if ((char === " " || char === ";") && !insideDoubleQuote && !insideSingleQuote && !insideSquareBracket) {
                parsedCommand.splitCommand.push(parsedCommand.searchKey);
                parsedCommand.searchKey = "";
            } else if (char === '"' && !insideSingleQuote && !insideSquareBracket) {
                insideDoubleQuote = !insideDoubleQuote;
            } else if (char === "'" && !insideDoubleQuote && !insideSquareBracket) {
                insideSingleQuote = !insideSingleQuote;
            } else if (char === "[" || char === "]" && !insideDoubleQuote && !insideSingleQuote) {

                if (char === "[")
                    insideSquareBracket = true;
                else if (char === "]")
                    insideSquareBracket = false;

            } else {
                parsedCommand.searchKey += char;
            }

            index++;
        }

        if (parsedCommand.searchKey)//true if not ""
            parsedCommand.splitCommand.push(parsedCommand.searchKey);

        if (insideDoubleQuote)
            parsedCommand.errors.push(`Invalid command: missing closing double quote`);

        if (insideSingleQuote)
            parsedCommand.errors.push(`Invalid command: missing closing single quote`);

        if (insideSquareBracket)
            parsedCommand.errors.push(`Invalid command: missing closing square bracket`);

    }

    private static ParseToType<T extends Boolean | String | Number | Array<any>>(type: (...args: any[]) => T, value: string): boolean | string | number | Array<any> | undefined {

        switch (type.name.toLowerCase()) {
            case "number":
                let number: number = Number(value);

                if (!isNaN(number))
                    return number;
                break;
            case "string":
                return value;
            case "boolean":
                return Boolean(value);
            case "array":
                try {
                    return JSON.parse(value);
                } catch (err) { }
        }

        return undefined;
    }

}