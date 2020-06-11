import { IConfiguration } from "./interfaces/IConfiguration.js";
import { IStartup } from "./interfaces/IStartup.js";
import { ServiceCollection } from "../../dependency-injection/js/DependencyInjection.js";
import { ActionCommander } from "./ActionCommander.js";

export const ActionCommanderBuilder = new class ActionCommanderBuilder {

    private _configuration?: IConfiguration;
    private _startup?: new (configuration?: IConfiguration) => IStartup;

    constructor() {
        this._configuration = null;
        this._startup = null;
    }

    /**
     * Allows you to supply a configuration to use.
     * @param config The config to use
     */
    public buildConfiguration(config: IConfiguration): ActionCommanderBuilder {
        this._configuration = config;
        return this;
    }

    /**
     * Allows for you to supply a startup class to help configure services and middleware/plugins
     * @param startupClass The startup class to use
     */
    public startup(startup: new (configuration?: IConfiguration) => IStartup): ActionCommanderBuilder {
        this._startup = startup;
        return this;
    }

    /**
     * Uses the startup class and/or configuration supplied if any to start action commander
     */
    public run(): void {

        //init startup
        let startup = new this._startup(this._configuration);

        //initialize services
        startup.configureServices(ServiceCollection);

        //construct actionCommander
        let app: ActionCommander = new ActionCommander(this._configuration);

        //run startup configure
        startup.configure(app);

        app.init()

    }

}