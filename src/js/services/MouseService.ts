import { service } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { Vector } from "../helpers/vector.js";
import { Observable, fromEvent } from "../../lib/observable/js/observable.js";
import { CanvasService } from "./CanvasService.js";


@service()
export class MouseService {

    public readonly position: Vector;
    public readonly $position: Observable<Vector>;

    public readonly canvasPosition: Vector;
    public readonly $canvasPosition: Observable<Vector>;

    public readonly wheelPosition: IWheelPosition;
    public readonly $wheelPosition: Observable<IWheelPosition>;

    public readonly _canvas: CanvasService;

    constructor(canvas: CanvasService) {
        this._canvas = canvas;

        this.position = new Vector();
        this.$position = fromEvent<MouseEvent, Vector>(
            this._canvas.interactionLayer, "mousemove", (e: MouseEvent) => {
                this.position.x = e.offsetX;
                this.position.y = e.offsetY;
                return new Vector(this.position.x, this.position.y)
            }, this.position);

        this.canvasPosition = new Vector();
        this.$canvasPosition = this.$position.map((value) => {
            this.canvasPosition.x = value.x - canvas.x;
            this.canvasPosition.y = value.y - canvas.y;
            return new Vector(this.canvasPosition.x, this.canvasPosition.y);
        });

        this.wheelPosition = { deltaX: 0, deltaY: 0 };
        this.$wheelPosition = fromEvent(this._canvas.interactionLayer, "onwheel", (e: WheelEvent) => {
            this.wheelPosition.deltaX = e.deltaX;
            this.wheelPosition.deltaY = e.deltaY;
            return this.wheelPosition
        });
    }
}

export interface IWheelPosition {
    deltaX: number;
    deltaY: number;
}