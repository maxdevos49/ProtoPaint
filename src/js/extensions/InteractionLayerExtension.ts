import { extension } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { IActionExtension } from "../../lib/action-commander/js/interfaces/IActionExtension.js";
import { IActionCommander } from "../../lib/action-commander/js/ActionCommander.js";
import { InteractionModeService } from "../services/InteractionModeService.js";
import { CanvasService } from "../services/CanvasService.js";

@extension()
export class InteractionLayer implements IActionExtension {

    // private readonly _actionCommander: IActionCommander;
    private readonly _ims: InteractionModeService;

    private readonly _interactionLayer: HTMLDivElement;

    constructor(actionCommander: IActionCommander, interactionModeService: InteractionModeService, canvasService: CanvasService) {
        // this._actionCommander = actionCommander;
        this._ims = interactionModeService;
        this._interactionLayer = canvasService.interactionLayer;

    }

    public init(): void {
        //On Click
        this._interactionLayer.addEventListener("click", (e) => {
            e.preventDefault()
            this._ims.activeInteractionMode.onMouseClick?.(e);
        }, false);

        //On Mouse Down
        this._interactionLayer.addEventListener("mousedown", (e) => {
            e.preventDefault()
            this._ims.activeInteractionMode.onMouseDown?.(e);
        }, false);

        //On Mouse Up
        this._interactionLayer.addEventListener("mouseup", (e) => {
            e.preventDefault()
            this._ims.activeInteractionMode.onMouseUp?.(e);
        }, false);

        //On Mouse Move
        this._interactionLayer.addEventListener("mousemove", (e) => {
            e.preventDefault()
            this._ims.activeInteractionMode.onMouseMove?.(e);
        }, false);

        //On Wheel
        this._interactionLayer.addEventListener("wheel", (e) => {
            e.preventDefault()
            this._ims.activeInteractionMode.onWheel?.(e);
        }, false);

        //On Context Menu
        this._interactionLayer.addEventListener("contextmenu", (e) => {
            e.preventDefault()
            this._ims.activeInteractionMode.onContextMenu?.(e);
        }, false);

        //On double click
        this._interactionLayer.addEventListener("dblclick", (e) => {
            e.preventDefault()
            this._ims.activeInteractionMode.onMouseDblClick?.(e);
        }, false);

        //On Mouse enter
        this._interactionLayer.addEventListener("mouseenter", (e) => {
            e.preventDefault()
            this._ims?.activeInteractionMode.onMouseEnter?.(e);
        }, false);

        //On Mouse leave
        this._interactionLayer.addEventListener("mouseleave", (e) => {
            e.preventDefault()
            this._ims?.activeInteractionMode.onMouseLeave?.(e);
        }, false);
    }
}
