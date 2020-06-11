import { Canvas } from "./controllers/Canvas.js";
import { View } from "./controllers/View.js";
import { FooterConfiguration } from "./configurations/FooterConfiguration.js";
import { InteractionLayer } from "./extensions/InteractionLayerExtension.js";
import { EditMode } from "./modes/EditMode.js";
import { PanMode } from "./modes/PanMode.js";
import { CanvasService } from "./services/CanvasService.js";
import { FlagOptionService } from "./services/FlagOptionService.js";
import { FooterService } from "./services/FooterService.js";
import { InteractionModeService } from "./services/InteractionModeService.js";
import { MouseService } from "./services/MouseService.js";
import { PanelService } from "./services/PanelService.js";
import { ActionCommanderBuilder } from "../lib/action-commander/js/ActionCommandBuilder.js";
import { ActionCommander } from "../lib/action-commander/js/ActionCommander.js";
import { ActionHistory } from "../lib/action-commander/js/extensions/ActionHistory.js";
import { ActionSuggestions } from "../lib/action-commander/js/extensions/ActionSuggestions.js";
import { Autocomplete } from "../lib/action-commander/js/extensions/Autocomplete.js";
import { ErrorDisplay } from "../lib/action-commander/js/extensions/ErrorDisplay.js";
import { InputButtons } from "../lib/action-commander/js/extensions/InputButtons.js";
import { ToggleSearch } from "../lib/action-commander/js/extensions/ToggleSearch.js";
import { IConfiguration } from "../lib/action-commander/js/interfaces/IConfiguration.js";
import { IStartup } from "../lib/action-commander/js/interfaces/IStartup.js";
import { DataSourceCollection } from "../lib/action-commander/js/services/DataSourceCollection.js";
import { IServiceCollection } from "../lib/dependency-injection/js/DependencyInjection.js";
import { FileMenuExtension } from "./extensions/FileMenuExtension.js";
import { Edit } from "./controllers/Edit.js";
import { FileController } from "./controllers/FileController.js";
import { Help } from "./controllers/Help.js";
import { FlagForm } from "./extensions/FlagFormExtension.js";

class Startup implements IStartup {

    public configureServices(services: IServiceCollection): void {

        //#region internal services

        services.addSingleton(DataSourceCollection);

        //#endregion

        //custom services
        services.addSingleton(CanvasService);
        services.configure(CanvasService, (cs) => {
            cs.init();
        });

        services.addSingleton(PanelService);
        services.configure(PanelService, (ps) => {
            ps.registerPanel("Left", 'div[data-panel="left"]');
            ps.registerPanel("Right", 'div[data-panel="right"]');
        });

        services.addSingleton(InteractionModeService);
        services.configure(InteractionModeService, (ims) => {
            ims.registerMode("Pan", PanMode);
            ims.registerMode("Edit", EditMode);
        });

        services.addSingleton(FooterService);
        services.addSingleton(MouseService);
        services.addSingleton(FlagOptionService)

    }


    public configure(app: ActionCommander): void {

        //#region Internal optional extensions

        app.registerExtension(ToggleSearch);
        app.registerExtension(ErrorDisplay);

        //Records command history
        app.registerExtension(ActionHistory);
        app.configureExtension(ActionHistory, (ah) => {
            ah.historyDataSourceKey = "action-history";
        });

        //Updates the suggestions displayed in the autocomplete
        app.registerExtension(ActionSuggestions);
        app.configureExtension(ActionSuggestions, (as) => {
            as.defaultDataSourceKey = "suggestions";
            as.onFocusDataSourceKey = "controllers";
        })

        //Register and configure the autocomplete extension
        app.registerExtension(Autocomplete);
        app.configureExtension(Autocomplete, (ac) => {
            ac.defaultDataSourceKey = "suggestions";
            ac.sourceToggles = new Map([
                ["Alt", "action-history"]
            ]);
        });

        app.registerExtension(InputButtons);
        app.configureExtension(InputButtons, (ib) => {
            ib.buttons = new Map([
                [`<i class="fas fa-play"></i>`, (a) => a.submitSearch()],
                [`<i class="fas fa-times"></i>`, (a) => a.clear()],
            ])
        });

        //#endregion

        //Custom extensions
        app.registerExtension(InteractionLayer);
        app.registerExtension(FooterConfiguration);
        app.registerExtension(FileMenuExtension);
        app.registerExtension(FlagForm);
        //...

    }
}

let config: IConfiguration = {
    actionControllers: [
        FileController,
        Edit,
        View,
        Canvas,
        Help
    ]

}

function main() {
    ActionCommanderBuilder
        .buildConfiguration(config)
        .startup(Startup)
        .run();
}

//entry point
main();