import { IDataPart } from "../../lib/action-commander/js/services/DataSourceCollection.js";
import { service } from "../../lib/dependency-injection/js/DependencyInjection.js";


export interface IFlagSuggestion<T> {
    name: string;
    sourceSelector: () => T[];
    formatterSelector: (value: T) => IDataPart;
}

@service()
export class FlagOptionService {

    private readonly options: Map<string, IFlagSuggestion<any>>;

    constructor() {
        this.options = new Map();

        //boolean
        this.registerOptions({
            name: Boolean.name,
            sourceSelector: () => [true, false],
            formatterSelector: (value: boolean) => ({ value: value + "" })
        })
    }


    public registerOptions(flagOptions: IFlagSuggestion<any>): void {

        if (!flagOptions)
            throw new TypeError("flag options cannot be null or undefined.");

        if (flagOptions.name === null || flagOptions.name === undefined)
            throw new TypeError("Flag name must be defined");

        if (flagOptions.sourceSelector === null || flagOptions.sourceSelector === undefined)
            throw new TypeError("Flag SourceSelector must be defined");

        if (flagOptions.formatterSelector === null || flagOptions.formatterSelector === undefined)
            throw new TypeError("Flag formatterSelector must be defined");

        if (this.options.has(flagOptions.name))
            throw new Error(`The FlagOption: "${flagOptions.name}" already exist. Try using a different name`);

        this.options.set(flagOptions.name, flagOptions);
    }

    public getOptions(optionKey: string): IDataPart[] | null {

        if (optionKey === null || optionKey === undefined)
            throw new TypeError("optionKey cannot be null or undefined");

        if (!this.options.has(optionKey))
            return null;

        let flagSuggestion = this.options.get(optionKey);
        let data = flagSuggestion.sourceSelector();

        return data.map(flagSuggestion.formatterSelector);
    }


}