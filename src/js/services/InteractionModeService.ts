import { service, Injector } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { Observable, Subject, fromProperty } from "../../lib/observable/js/observable.js";
import { IInteractionMode } from "../interfaces/IInteractionMode.js";

export function InteractionMode(): ClassDecorator {
    return function (target: any) {
        //something here someday
    }
}

@service()
export class InteractionModeService {

    public activeInteractionModeKey: string;
    public readonly $activeInteractionModeKey: Observable<string>;

    public activeInteractionMode: IInteractionMode;
    public readonly $activeInteractionMode: Observable<IInteractionMode>;


    private readonly _interactionModes: Map<string, IInteractionMode>;
    private readonly _$interactionModes: Subject<string[]>;

    public interactionModesKeys: string[];
    public readonly $interactionModesKeys: Observable<string[]>;

    constructor() {

        //init observables
        this.activeInteractionMode = null;
        this.$activeInteractionMode = fromProperty(this, "activeInteractionMode");

        this._interactionModes = new Map();
        this._$interactionModes = new Subject<string[]>()
        this.$interactionModesKeys = this._$interactionModes.toObservable();

        this.activeInteractionModeKey = "Pan";
        this.$activeInteractionModeKey = fromProperty(this, "activeInteractionModeKey");

        //subscribe to the interaction key
        this.$activeInteractionModeKey.subscribe(mode => {

            if (this._interactionModes.has(mode))
                this.activeInteractionMode = this._interactionModes.get(mode);
        });
    }

    public registerMode(modeKey: string, mode: new (...args: any[]) => IInteractionMode): void {
        if (this._interactionModes.has(modeKey))
            throw new Error(`The InteractionMode: "${modeKey}" is already registered. Try using a different name.`);


        this._interactionModes.set(modeKey, Injector.resolve<IInteractionMode>(mode));
        let keys = [...this._interactionModes.keys()];
        this.interactionModesKeys = keys;
        this._$interactionModes.next(keys);

        //activate first registered mode
        if (this._interactionModes.size === 1)
            this.activeInteractionModeKey = modeKey;
    }
}