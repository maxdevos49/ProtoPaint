import { specification, it, expect } from "prototest";
import { ProjectService } from "../../src/js/services/ProjectService.js";
import { LayerType } from "../../src/js/interfaces/IPaintLayer.js";
import { IPaintFrame } from "../../src/js/interfaces/IPaintFrame.js";

specification({
    title: "Project Service",
    authors: [
        "Maxwell DeVos",
    ],
    description: "",
    specs: [
        ["Initialization", () => {
            let service = new ProjectService();
            let latest: IPaintFrame[];
            let sub = service.$frames.subscribe(v => latest = v);

            it("Should have zero frames", () => {
                expect(latest).toBeDefined();
                expect(latest.length).toStrictEqual(0);
            });

            sub.unsubscribe();
        }],
        ["addFrame", () => {
            let service = new ProjectService();
            let latest: IPaintFrame[];
            let sub = service.$frames.subscribe(v => latest = v);

            it("Should have the method addFrame", () => {
                expect(service).toHaveMethod("addFrame");
            });

            it("Should throw a typeError if not passed a valid string", () => {
                expect(() => service.addFrame(null)).toThrow(TypeError);
                expect(() => service.addFrame(undefined)).toThrow(TypeError);
                expect(() => service.addFrame("")).toThrow(TypeError);
            });

            let frame = service.addFrame("Test");

            it("Should return a IPaintFrame object with correct default layer", () => {
                expect(frame.name).toBe("Test");
                expect(frame.layers.length).toBe(1);
            });

            it("Should have a length of 1 returned by the frame observable", () => {
                expect(latest.length).toStrictEqual(1);
            });

            service.addFrame("Frame 2");

            it("Should have a length of 2 returned by the frame observable", () => {
                expect(latest.length).toStrictEqual(2);
            });

            it("Should throw a Error if the same frame name is used more then once", () => {
                expect(() => service.addFrame("Test")).toThrow(Error);
            });

            sub.unsubscribe();
        }],
        ["removeFrame", () => {
            let service = new ProjectService();
            let latest: IPaintFrame[];
            let sub = service.$frames.subscribe(v => latest = v);

            it("Should throw a TypeError if the frameName is not a string or more then 1 character", () => {
                expect(() => service.removeFrame(null)).toThrow(TypeError);
                expect(() => service.removeFrame(undefined)).toThrow(TypeError);
                expect(() => service.removeFrame("")).toThrow(TypeError);
            });

            it("Should throw a Error if the frameName is not present in frameMap", () => {
                expect(() => service.removeFrame("Frame 2")).toThrow(Error);
            });

            it("Should decrease the current amount of frames to 0", () => {
                service.addFrame("Frame 1");
                expect(latest.length).toBe(1);
                service.removeFrame("Frame 1");
                expect(latest.length).toBe(0);
            });

            sub.unsubscribe();
        }],
        ["addLayerToFrame", () => {
            let service = new ProjectService();

            it("Should throw a TypeError if frameName or layerName is not a valid string", () => {
                expect(() => service.addLayerToFrame(undefined, undefined)).toThrow(TypeError);
                expect(() => service.addLayerToFrame(null, undefined)).toThrow(TypeError);
                expect(() => service.addLayerToFrame(null, null)).toThrow(TypeError);
                expect(() => service.addLayerToFrame("", null)).toThrow(TypeError);
                expect(() => service.addLayerToFrame("", "")).toThrow(TypeError);
                expect(() => service.addLayerToFrame(null, "")).toThrow(TypeError);
                expect(() => service.addLayerToFrame(undefined, null)).toThrow(TypeError);
            });

            it("Should throw a error if the frame does not exist", () => {
                expect(() => service.addLayerToFrame("Test", "Layer 1")).toThrow(Error);
            });

            service.addFrame("Test");

            it("Should throw an error if the layer name is already used for the frame", () => {
                expect(() => service.addLayerToFrame("Test", "Layer 1")).toThrow(Error);
            });

            let layer = service.addLayerToFrame("Test", "Layer 2");

            it("Should return a valid IPaintLayer with a Pixel Layer", () => {
                expect(layer.name).toBe("Layer 2");
                expect(layer.layerType).toBe(LayerType.Pixel);
                expect(layer.pixelData).toBeDefined();
                expect(layer.vectorData).toBeUndefined();

                //TODO test further default pixel data
            });

            layer = service.addLayerToFrame("Test", "Layer 3", LayerType.Vector);

            it("Should return a valid IPaintLayer with a Vector Layer", () => {
                expect(layer.name).toBe("Layer 3");
                expect(layer.layerType).toBe(LayerType.Vector);
                expect(layer.vectorData).toBeDefined();
                expect(layer.pixelData).toBeUndefined();

                //TODO test further default vector data
            });


        }],
        ["removeLayerFromFrame", () => {
            let service = new ProjectService();

            it("Should throw a TypeError when frameName and/or layerName is not a valid string with at least 1 character", () => {
                expect(() => service.removeLayerFromFrame(undefined, undefined)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(null, undefined)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(null, null)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame("", null)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame("", "")).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(null, "")).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(undefined, "")).toThrow(TypeError);
            });

            it("Should throw a error if the frameName and/or layerName is not valid", () => {
                expect(() => service.removeLayerFromFrame("Test", "Test")).toThrow(Error);
                service.addFrame("Frame 1");
                expect(() => service.removeLayerFromFrame("Frame 1", "Test")).toThrow(Error);

                service.removeLayerFromFrame("Frame 1", "Layer 1");
            });

        }]
    ]
});