import { service } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { Observable, fromProperty } from "../../lib/observable/js/observable.js";

@service()
export class CanvasService {

    public canvasId: string;
    public interactionLayerId: string;
    public maximumScale: number;
    public minimumScale: number;
    public dblClickScale: number;


    public element: HTMLCanvasElement;
    public interactionLayer: HTMLDivElement;
    public context: CanvasRenderingContext2D;

    /**
     * The current x position of the canvas
     */
    public x: number;
    public readonly $x: Observable<number>;

    /**
     * The current y position of the canvas
     */
    public y: number;
    public readonly $y: Observable<number>;

    /**
     * The non scaled width of the canvas
     */
    public width: number;
    public readonly $width: Observable<number>;

    /**
     * The non scaled height of the canvas
     */
    public height: number;
    public readonly $height: Observable<number>;

    /**
     * The x origin of the canvas. if the the canvas is 100px wide then an origin of 0 would equal 0 and an origin of 1 would equal 100
     */
    public originX: number;
    public readonly $originX: Observable<number>;

    /**
     * The y origin of the canvas. if the the canvas is 100px tall then an origin of 0 would equal 0 and an origin of 1 would equal 100
     */
    public originY: number;
    public readonly $originY: Observable<number>;

    /**
     * The current scale of the canvas
     */
    public scale: number;
    public readonly $scale: Observable<number>;



    constructor() {
        //default values
        this.canvasId = "protoCanvas";
        this.interactionLayerId = "interaction-layer";
        this.maximumScale = 4;
        this.minimumScale = 0.25;
        this.dblClickScale = 0.25;

        //observables config
        this.x = 0;
        this.$x = fromProperty(this, "x");

        this.y = 0;
        this.$y = fromProperty(this, "y");

        this.width = 500;
        this.$width = fromProperty(this, "width");

        this.height = 500;
        this.$height = fromProperty(this, "height");

        this.originX = 0;
        this.$originX = fromProperty(this, "originX", v => Math.round((v + Number.EPSILON) * 10000) / 10000)

        this.originY = 0;
        this.$originY = fromProperty(this, "originY", v => Math.round((v + Number.EPSILON) * 10000) / 10000);

        this.scale = 1;
        this.$scale = fromProperty(this, "scale", v => Math.round((Math.min(Math.max(v, this.minimumScale), this.maximumScale) + Number.EPSILON) * 100) / 100);

    }

    public pan(xOffset: number, yOffset: number): void {
        this.x += xOffset;
        this.y += yOffset;
    }

    public setTranslation(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    public setOrigin(x: number, y: number): void {
        this.originX = x;
        this.originY = y;
    }

    public setScale(scale: number): void {
        this.scale = scale;
    }

    public scaleFromPoint(scale: number, x: number, y: number): void {
        let newScale = scale;
        let scaleChange = this.scale - newScale;

        let zoomPointX = (x - this.x) / this.scale;
        let zoomPointY = (y - this.y) / this.scale;

        if (newScale < this.maximumScale && newScale > this.minimumScale) {
            this.setScale(scale);
            this.pan((zoomPointX * scaleChange), (zoomPointY * scaleChange));
        }
    }

    public centerCanvas(): void {
        let interBounds = this.interactionLayer.getBoundingClientRect();
        let canvasBounds = this.element.getBoundingClientRect();

        this.x = interBounds.width / 2 - canvasBounds.width / 2;
        this.y = interBounds.height / 2 - canvasBounds.height / 2;
    }

    public init(): void {

        //init and verify elements
        this.element = document.getElementById(this.canvasId) as HTMLCanvasElement;
        this.interactionLayer = document.getElementById(this.interactionLayerId) as HTMLDivElement;

        if (!this.element)
            throw new Error(`The canvas id: "${this.canvasId}" is not valid.`);

        if (!this.interactionLayer)
            throw new Error(`The interaction layer id: ${this.interactionLayerId} is not valid`);

        //get render context
        this.context = this.element.getContext("2d");

        if (!this.context)
            throw new Error("The canvas context failed to be initialized.");

        //set variables to actual values
        let canvasBounds = this.element.getBoundingClientRect();
        this.x = canvasBounds.x;
        this.y = canvasBounds.y;
        this.width = canvasBounds.width;
        this.height = canvasBounds.height;

        //init observers
        this.$x.subscribe(v => this.applyTransformations());
        this.$y.subscribe(v => this.applyTransformations());
        this.$width.subscribe(v => {
            this.element.width = this.width;//resets canvas
            this.applyTransformations()
        });
        this.$height.subscribe(v => {
            this.element.height = this.height;//clears canvas
            this.applyTransformations()
        });
        this.$originX.subscribe(v => this.applyTransformations());
        this.$originY.subscribe(v => this.applyTransformations());
        this.$scale.subscribe(v => this.applyTransformations());

        this.centerCanvas();
    }

    private applyTransformations(): void {
        this.element.style.transformOrigin = `${this.originX * 100}% ${this.originY * 100}%`;
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    }
}
