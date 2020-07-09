export enum LayerType {
    Pixel,
    Vector
}

export interface IPaintLayer {
    name: string;

    layerType: LayerType;

    pixelData?: IPixelData;

    vectorData?: IVectorData;


}

export interface IPixelData {
    columns: number;

    rows: number;

    grid: number[];
}

export interface IVectorData {
    //TODO when ready for vector graphics
}