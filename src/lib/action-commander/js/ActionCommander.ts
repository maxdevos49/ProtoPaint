import { IActionController } from "./interfaces/IActionController.js";
import { IActionExtension, IActionExtensionConstructor } from "./interfaces/IActionExtension.js";
import { IParsedCommand } from "./interfaces/IParsedCommand.js";
import { IConfiguration } from "./interfaces/IConfiguration.js";
import { Injector } from "../../dependency-injection/js/DependencyInjection.js";
import { getActionsMetadata } from "./helpers/ActionDecorators.js";
import { IFlag } from "./interfaces/IFlag.js";
import { CommandParser } from "./helpers/CommandParser.js";
import { KeyCommander } from "../../key-commander/js/KeyCommander.js";

//#region IActionCommander

export interface IActionCommander {

    readonly controllers: Map<string, IActionController>;

    registerExtension<T extends IActionExtension>(extension: IActionExtensionConstructor<T>): void;
    configureExtension<T extends IActionExtension>(extension: IActionExtensionConstructor<T>, configureCallback: (extension: T) => void): void;
    activateExtensionHook(hookCallback: (extension: IActionExtension) => void): void;

    registerController<T>(controller: new (...args: any[]) => T): void;

    parseCommand(command: string): IParsedCommand;
    executeCommand(parsedCommand: IParsedCommand): boolean;
    parseAndExecuteCommand(command: string): boolean;

    focus(): void;
    blur(): void;
    clear(): void;
    getText(): string;
    setText(text: string): void;
    appendText(text: string): void;
    isFocused(): boolean;
    submitSearch(): void;
    appendChildElement(element: HTMLDivElement): void;
    appendButtonElement(element: HTMLButtonElement): void;
    registerKeyBinding(keyCombo: string, action: () => void): void;

    init(): void;
}

//#endregion

export class ActionCommander implements IActionCommander {
    public readonly controllers: Map<string, IActionController>;

    private _searchContainer: HTMLDivElement;
    private readonly _configuration: IConfiguration;
    private readonly _inputElement: HTMLInputElement;
    private readonly _inputElementContainer: HTMLDivElement;
    private readonly _extensions: Map<IActionExtensionConstructor<any>, IActionExtension>;
    private readonly _extensionConfigurations: Map<IActionExtensionConstructor<any>, (extension: any) => void>;

    constructor(configuration: IConfiguration) {
        this._configuration = configuration;

        this.controllers = new Map();
        this._extensions = new Map();
        this._extensionConfigurations = new Map();//<i class="fas fa-times"></i>
        this._inputElementContainer = document.createElement("DIV") as HTMLDivElement;
        this._inputElement = document.createElement("INPUT") as HTMLInputElement;
    }


    //#region Extension Configuration

    public registerExtension<T extends IActionExtension>(extension: IActionExtensionConstructor<T>): void {

        if (this._extensions.has(extension))
            throw new Error(`The extension with the name of: ${extension.name} already exist. Extensions can only be registered once`);

        let tokens = Reflect.getMetadata("design:paramtypes", extension) ?? [];
        tokens.shift();//The first argument will always be ActionCommander

        this._extensions.set(extension, new extension(this, ...Injector.resolveGroup(tokens)));
    }

    public configureExtension<T extends IActionExtension>(extension: IActionExtensionConstructor<T>, configureCallback: (extension: T) => void): void {

        if (this._extensionConfigurations.has(extension))
            throw new Error(`The extension with the name of: ${extension.name} is already configured. Extensions can only be configured once.`);

        this._extensionConfigurations.set(extension, configureCallback);
    }

    public activateExtensionHook(hookCallback: (extension: IActionExtension) => void): void {
        this._extensions.forEach(ext => {
            hookCallback(ext);
        });
    }



    //#endregion

    //#region Controller Configuration

    public registerController<T>(controller: new (...args: any[]) => T): void {

        let controllerName = Reflect.getMetadata("name", controller);

        if (!controllerName) {
            console.warn(`The controller: "${controller.name}" was not added due to metadata not being found`);
            return;
        }

        if (this.controllers.has(controllerName)) {
            console.warn(`The controller: "${controller.name}" with command name: "${controllerName}" is registered more than once! The repeated occurrences will be omitted`);
            return;
        }

        let instance = Injector.resolve<T>(controller);

        //Build controller metadata
        let controllerInfo: IActionController = {
            name: controllerName,
            summary: Reflect.getMetadata("summary", controller),
            description: Reflect.getMetadata("summary", controller),
            controller: instance,
        }

        //remap the actions by action name and not method
        controllerInfo.actions = new Map([...getActionsMetadata(instance)].map(value => [value[1].name, value[1]]));

        //add flag metadata to actions
        controllerInfo?.actions?.forEach((action) => {

            // Variation registration for keyboard shortcuts
            action.variations?.forEach((variation) => {
                if (variation.keyCombination) {
                    this.registerKeyBinding(variation.keyCombination, () => {
                        this.parseAndExecuteCommand(`${controllerName} ${action.name} ${variation.flagOptions}`);
                    });
                }
            });

            // Flag registration
            if (!Reflect.hasMetadata("flags", instance, action.methodKey))
                Reflect.defineMetadata("flags", new Map<string, IFlag>(), instance, action.methodKey);

            action.flags = Reflect.getMetadata("flags", instance, action.methodKey);
        });

        this.controllers.set(controllerInfo.name, controllerInfo);
    }

    //#endregion

    //#region Parsing and Execution

    public parseCommand(command: string): IParsedCommand {
        return CommandParser.parse(command, this.controllers);
    }


    public executeCommand(parsedCommand: IParsedCommand): boolean {

        if (!parsedCommand.isValid) {
            console.error(parsedCommand.errors)
            return false;
        }

        this.activateExtensionHook(e => e?.onExecution?.(parsedCommand));

        if (parsedCommand.cancelExecution) {
            this.activateExtensionHook(e => e?.onExecutionCancel?.(parsedCommand));
            return false;
        }

        try {
            parsedCommand.controllerMetaData.controller[parsedCommand.actionMetaData.methodKey](...parsedCommand.actionArguments);
        } catch (err) {
            parsedCommand.errors.push(err);
            return false;
        }

        return true;
    }

    public parseAndExecuteCommand(command: string): boolean {
        return this.executeCommand(this.parseCommand(command));
    }

    //#endregion

    //#region Search Manipulation

    public focus(): void {
        this.activateExtensionHook(ext => ext.onFocus?.());
        this._inputElement.focus();
    }

    public blur(): void {
        (document.activeElement as HTMLElement).blur();
        this.activateExtensionHook(ext => ext.onBlur?.());
    }

    public isFocused(): boolean {
        return document.activeElement === this._inputElement;
    }

    public clear(): void {
        this._inputElement.value = "";
        this.activateExtensionHook(ex => ex.onChange?.());
    }

    public getText(): string {
        return this._inputElement.value;
    }

    public setText(text: string): void {
        this._inputElement.value = text;
        this.activateExtensionHook(ex => ex.onChange?.());
    }

    public appendText(text: string): void {
        this._inputElement.value += text;
        this.activateExtensionHook(ex => ex.onChange?.());
    }

    public appendChildElement(element: HTMLDivElement): void {
        this._searchContainer.appendChild(element);
    }

    public appendButtonElement(element: HTMLButtonElement): void {
        this._inputElementContainer.appendChild(element);
    }


    public submitSearch(): void {
        if (this.getText().length === 0)
            return;

        let parsedCommand = this.parseCommand(this.getText());
        this.activateExtensionHook(ext => ext.onSubmit?.(parsedCommand));

        if (this.executeCommand(parsedCommand)) {
            this.activateExtensionHook(ext => ext.onSuccess?.(parsedCommand));
        } else {
            this.activateExtensionHook(ext => ext.onError?.(parsedCommand));
        }
    }

    //#endregion

    //#region KeyBinding

    public registerKeyBinding(keyCombo: string, action: () => void) {
        if (KeyCommander.bindingExist(keyCombo))
            throw new Error(`The keybinding: "${keyCombo}" already exist. There can not be duplicate keybindings.`);

        KeyCommander.bind(keyCombo, () => {
            action();
        });
    }

    //#endregion

    //#region Initialization

    public init(): void {

        this.initUI();
        this.initEvents();

        //register controllers
        this._configuration?.actionControllers?.forEach((controller) => {
            this.registerController(controller);
        });

        //configure extensions
        this._extensionConfigurations.forEach((extensionConfiguration, extensionKey) => {
            if (this._extensions.has(extensionKey)) {
                extensionConfiguration(this._extensions.get(extensionKey));
            }
        });

        //init extensions
        this.activateExtensionHook((extension) => extension.init());
    }

    private initUI(): void {

        this._searchContainer = document.getElementById(this._configuration.searchContainerId ?? "search-container") as HTMLDivElement;

        if (!this._searchContainer)
            throw new Error(`The SearchContainerId: ${this._configuration.searchContainerId ?? "search-container"} is not valid. Aborting Initialization.`);

        //Input Element container
        this._inputElementContainer.setAttribute("class", "input-container")
        this._searchContainer.appendChild(this._inputElementContainer);

        //input
        this._inputElement.setAttribute("type", "text");
        this._inputElement.setAttribute("placeholder", "ActionSearch");
        this._inputElement.setAttribute("tabindex", "-1");
        this._inputElementContainer.appendChild(this._inputElement);
    }

    private initEvents(): void {

        this._inputElement.addEventListener("keydown", (e) => {

            if (e.altKey || e.metaKey || e.ctrlKey || e.key === "Tab")
                e.preventDefault();//prevent all special actions like printing :D

            this.activateExtensionHook(ext => ext.onInput?.(e));

            if (e.key.length > 1)//input event doesn't fire for 
                this.activateExtensionHook(ex => ex.onChange?.());

            if (e.key === "Enter")
                this.submitSearch();

        }, false);

        this._inputElement.addEventListener("input", () => {
            this.activateExtensionHook(ex => ex.onChange?.());
        })

        this._inputElement.addEventListener("focusin", () => {
            this.focus();
        }, false);

        this._inputElement.addEventListener("focusout", () => {
            this.blur();
        }, false);

    }

    //#endregion

}