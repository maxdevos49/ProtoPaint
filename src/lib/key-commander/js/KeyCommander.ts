export class KeyCommander {

    private static _instance: KeyCommander = new KeyCommander();

    private _activeKeys: string[];

    private _keyBindings: Map<string, (e: KeyboardEvent, combo: string) => boolean | void>;

    private _stopCallbackFunc: (e: KeyboardEvent, element: HTMLElement) => boolean;

    public constructor() {
        this._activeKeys = new Array<string>();
        this._keyBindings = new Map<string, (e: KeyboardEvent, combo: string) => boolean | void>();

        this._stopCallbackFunc = (e: KeyboardEvent, element: HTMLElement) => {

            return element.tagName === "INPUT"
                || element.tagName === "SELECT"
                || element.tagName === "TEXTAREA"
                || (element.contentEditable === "true");
        };

        this.init();
    }

    /**
     * Binds the given combination to the key listener
     * @param combination the combination of keys to press
     * @param callback the action to perform when the key combination is pressed
     */
    public static bind(combination: string, callback: (e: KeyboardEvent, combo: string) => boolean | void): void {

        let combo: string = this.formatCombination(combination);

        this._instance._keyBindings.set(combo, callback)
    }

    /**
     * Checks to see if a given binding already exist
     * @param combination the binding to check for
     */
    public static bindingExist(combination: string): boolean {

        let combo: string = this.formatCombination(combination);

        if (this._instance._keyBindings.has(combo))
            return true;

        return false;
    }


    /**
     * Removes a key binding
     * @param combination the binding to remove
     */
    public static unbind(combination: string): void {

        let combo: string = this.formatCombination(combination);

        if (this._instance._keyBindings.has(combo))
            this._instance._keyBindings.delete(combo);

    }

    /**
     * Clears all key bindings and their callbacks
     */
    public static reset(): void {
        this._instance._keyBindings.clear();
    }

    /**
     * Triggers a key binding
     * @param combination the key combination 
     */
    public static trigger(combination: string, e?: KeyboardEvent): void {

        let combo = this.formatCombination(combination);

        if (this._instance._keyBindings.has(combo)) {
            if (!this._instance._keyBindings?.get(combo)(e, combo)) {
                e?.preventDefault();
            }
        }
    }

    /**
     * Formats a key binding string
     * @param combination the intial key binding string
     */
    private static formatCombination(combination: string): string {
        return combination.split("+").sort().join("+");
    }

    private init(): void {

        /**
         * Track keys down
         */
        document.addEventListener("keydown", (e: KeyboardEvent) => {

            let key = e.key;

            if (this._stopCallbackFunc(e, e.target as HTMLElement))
                return;

            e.preventDefault();

            //@ts-ignore
            if (!this._activeKeys.includes(key))
                this._activeKeys.push(key);

            KeyCommander.trigger(this._activeKeys.join("+"), e);
        }, false);

        /**
         * Track keys released
         */
        document.addEventListener("keyup", (e) => {
            e.preventDefault();

            let key = e.key;

            if (key === "Meta") {//This is a hack because on macos the meta key is special and a pain in the ass
                this._activeKeys = [];
                return;
            }

            //remove key from active keys
            let index = this._activeKeys.indexOf(key);

            if (index > -1) {
                this._activeKeys.splice(index, 1);
            }


        }, false);
    }

}


