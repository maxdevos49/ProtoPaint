import { extension } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { IActionExtension } from "../../lib/action-commander/js/interfaces/IActionExtension.js";
import { IActionCommander } from "../../lib/action-commander/js/ActionCommander.js";
import { IParsedCommand } from "../../lib/action-commander/js/interfaces/IParsedCommand.js";
import { PanelService } from "../services/PanelService.js";
import { DataSourceCollection } from "../../lib/action-commander/js/services/DataSourceCollection.js";


@extension()
export class FlagForm implements IActionExtension {

    private readonly _actionCommander: IActionCommander;
    private readonly _panelService: PanelService;
    private readonly _dsc: DataSourceCollection;

    private readonly _flagFormContainer: HTMLDivElement;

    constructor(actionCommander: IActionCommander, panelService: PanelService, dsc: DataSourceCollection) {
        this._actionCommander = actionCommander;
        this._panelService = panelService;
        this._dsc = dsc;

        this._flagFormContainer = document.createElement("DIV") as HTMLDivElement;
    }

    public init(): void {
        this._actionCommander.appendChildElement(this._flagFormContainer);
    }

    public onExecution(parsedCommand: IParsedCommand): void {
        if (parsedCommand.actionMetaData?.flags.size > 0 && parsedCommand.rawValues.size === 0)
            parsedCommand.cancelExecution = true;
    }

    public onExecutionCancel(parsedCommand: IParsedCommand): void {

        //show the search
        this._panelService.showSearch();

        //set incomplete text
        this._actionCommander.setText(parsedCommand.command);
    }

}

