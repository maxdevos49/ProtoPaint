import { actioncontroller, bindVariation, action, flag } from "../../lib/action-commander/js/helpers/ActionDecorators.js";
import { PanelService } from "../services/PanelService.js";

@actioncontroller("view", "Manage the View")
export class View {

    private readonly _panelService: PanelService;

    constructor(panelService: PanelService) {
        this._panelService = panelService;
    }

    @bindVariation("Show Action Search", "", "Meta+p")
    @action("search", "Shows the action search", "Shows the action search")
    public showSearch(): void {
        this._panelService.showSearch();
    }

    @bindVariation("Toggle Left Panel", "-p=left", "Control+l")
    @bindVariation("Toggle Right Panel", "-p=right", "Control+r")
    @action("togglepanel", "Toggle a Panel", "Toggles a panel with a given panel key.")
    public togglePanel(
        @flag(["-p", "--panel"], "The panel to target", "panels") panelKey: string
    ): void {
        if (panelKey.length > 0)
            this._panelService.togglePanel(panelKey.toLowerCase())
    }

    @action("hidepanel", "Hide a Panel", "Hides a panel with a given panel key.")
    public hidePanel(
        @flag(["-p", "--panel"], "The panel to target", "panels") panelKey: string
    ): void {
        if (panelKey.length > 0)
            this._panelService.hidePanel(panelKey.toLowerCase())
    }

    @action("showpanel", "Show a Panel", "Shows a panel with a given panel key.")
    public showPanel(
        @flag(["-p", "--panel"], "The panel to target", "panels") panelKey: string
    ): void {
        if (panelKey.length > 0)
            this._panelService.showPanel(panelKey.toLowerCase())
    }

    @bindVariation("Toggle Fullscreen Mode", "", "Shift+F11")
    @action("togglefullscreen", "Toggle Fullscreen Mode", "Toggle Fullscreen Mode")
    public toggleFullScreen(): void {

        // @ts-ignore
        let isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) || (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) || (document.mozFullScreenElement && document.mozFullScreenElement !== null) || (document.msFullscreenElement && document.msFullscreenElement !== null);

        if (!isInFullScreen) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }

    @action("enterfullscreen", "Enter Fullscreen Mode", "Enter Fullscreen Mode")
    public enterFullscreen(): void {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        }
        //@ts-ignore
        else if (document.documentElement.webkitRequestFullscreen) {//For safari
            //@ts-ignore
            document.documentElement.webkitRequestFullscreen();
        }
    }

    @action("exitfullscreen", "Exit Fullscreen Mode", "Exit Fullscreen Mode")
    public exitFullscreen(): void {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        //@ts-ignore
        else if (document.webkitExitFullscreen) {//For safari
            //@ts-ignore
            document.webkitExitFullscreen();
        }
    }

    @bindVariation("Enter Zenmode", "", "Meta+k")
    @action("zenmode", "Hides all of the clutter", "Hides all of the clutter and enables fullscreen")
    public zenMode(): void {
        this.enterFullscreen();

        let keys = this._panelService.getPanelKeys();
        keys.forEach(key => this._panelService.hidePanel(key));
    }

}
