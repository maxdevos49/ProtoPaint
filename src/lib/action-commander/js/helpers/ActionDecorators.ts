import { IAction } from "../interfaces/IAction.js";
import { IFlag } from "../interfaces/IFlag.js";
import { IActionBinding } from "../interfaces/IActionBinding.js";


//#region ActionController Decorator

/**
 * Annotates the class as a Action controller
 * @param name The controller name
 * @param summary Brief summary of the controllers actions
 * @param description Long description of the controller actions
 */
export function actioncontroller(name: string, summary: string, description?: string): ClassDecorator {
    return function (target: any) {

        Reflect.defineMetadata("name", name, target);
        Reflect.defineMetadata("summary", summary, target);
        Reflect.defineMetadata("description", description, target);

        initActionsMetadata(target);
    };
}

//#endregion


//#region Action Decorator

/**
 * Annotates the method as a Action method
 * @param name The name of the action
 * @param summary The brief description of the action
 * @param description The long description of the action
 */
export function action(name: string, summary: string, description?: string): MethodDecorator {

    return function (target: object, methodKey: string | symbol) {

        const actions = getActionsMetadata(target);

        actions.set(methodKey, {
            name: name,
            methodKey: methodKey,
            summary: summary,
            description: description,
        });

        Reflect.defineMetadata("actions", actions, target.constructor);
    }
}

//#endregion

//#region Flag Decorator

/**
 * Declares a parameter as a command flag
 * @param flags Flags the action contains
 */
export function flag(flags: Array<string>, description: string, suggestionsKey?: string): ParameterDecorator {

    return function (target: object, methodKey: string | symbol, parameterIndex: number): void {

        if (!Reflect.hasMetadata("flags", target, methodKey)) {
            Reflect.defineMetadata("flags", new Map<string, IFlag>(), target, methodKey);
        }

        let methodFlags = Reflect.getMetadata("flags", target, methodKey);

        //Register every variation of the flag in flag map with duplicate data
        flags.forEach((flag) => {

            let flagDefinition: IFlag = {
                parameterIndex: parameterIndex,
                name: flag,
                description: description,
                type: (Reflect.getMetadata("design:paramtypes", target, methodKey) as Array<any>)[parameterIndex],
                suggestionKey: suggestionsKey
            }

            methodFlags.set(flag, flagDefinition);

        });

        Reflect.defineMetadata("flags", methodFlags, target, methodKey);
    }
}

//#endregion

//#region Binding Decorator

/**
 * Binds a action with a given set of flags for use with a key combination or in ui menus
 * @param bindingDescription The description of the variation
 * @param flagOptions The flag options to use with the command;
 * @param keyCombo The key combination used to trigger the action
 */
export function bindVariation(bindingDescription: string, flagOptions: string, keyCombo?: string): MethodDecorator {

    return function (target: object, methodKey: string | symbol) {

        const actions = getActionsMetadata(target);

        if (!actions.has(methodKey))
            throw new Error("Variation bindings must be done after registering a action. Make sure the action decorator is the closest decorator to the method.")

        let action = actions.get(methodKey);

        let actionBinding: IActionBinding = {
            keyCombination: keyCombo,
            flagOptions: flagOptions,
            description: bindingDescription
        }

        if (!action.variations)
            action.variations = [];

        action.variations.push(actionBinding);

        Reflect.defineMetadata("actions", actions, target.constructor);
    }
}

//#endregion

//#region Helpers

/**
 * Inits action metadata if does not already exist
 * @param target The target to init it on
 */
function initActionsMetadata(target: object) {
    if (!Reflect.hasMetadata("actions", target.constructor))
        Reflect.defineMetadata("actions", new Map<string | symbol, IAction>(), target.constructor);
}

/**
 * Gets the action metadata from a target
 * @param target The target to get the actions from
 */
export function getActionsMetadata(target: any): Map<string | symbol, IAction> {

    initActionsMetadata(target);

    return Reflect.getMetadata("actions", target.constructor) as Map<string | symbol, IAction>;
}

//#endregion