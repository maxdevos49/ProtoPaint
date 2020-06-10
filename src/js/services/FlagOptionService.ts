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

        if (this.options.has(flagOptions.name))
            throw new Error(`The FlagOption: "${flagOptions.name}" already exist. Try using a different name`);

        this.options.set(flagOptions.name, flagOptions);
    }

    public getOptions(optionKeys: string): IDataPart[] | null {

        if (!this.options.has(optionKeys))
            return null;

        let flagSuggestion = this.options.get(optionKeys);
        let data = flagSuggestion.sourceSelector();

        return data.map(flagSuggestion.formatterSelector);
    }


}