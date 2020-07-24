import { specification, it, expect } from "prototest";
import { ProjectService } from "../../src/js/services/ProjectService.js";
import { LayerType } from "../../src/js/interfaces/IPaintLayer.js";

specification({
    title: "Project Service",
    authors: [
        "Maxwell DeVos",
    ],
    description: "",
    specs: [
        ["Initialization", () => {
            let service = new ProjectService();

            it("Should have zero frames", () => {
                let count = service.frameCount();
                expect(count).toBeDefined();
                expect(typeof count).toBe("number");
                expect(count).toStrictEqual(0);
            });

        }],
        ["addFrame", () => {
            let service = new ProjectService();

            it("Should have the method addFrame", () => {
                expect(service).toHaveMethod("addFrame");
            });

            it("Should throw a typeError if not passed a valid string", () => {
                expect(() => service.addFrame(null)).toThrow(TypeError);
                expect(() => service.addFrame(undefined)).toThrow(TypeError);
                expect(() => service.addFrame("")).toThrow(TypeError);
            });

            let frameIndex = service.addFrame("Test");

            it("Should return the index of the newly created frame which is 0", () => {
                expect(frameIndex).toBe(0);
            });


            it("Should have 1 frame in service", () => {
                let count = service.frameCount();
                expect(count).toStrictEqual(1);
            });

            service.addFrame("Frame 2");

            it("Should have 2 frames in service", () => {
                let count = service.frameCount();
                expect(count).toStrictEqual(2);
            });

        }],
        ["removeFrame", () => {
            let service = new ProjectService();

            it("Should throw a TypeError if the frameIndex is not a valid index", () => {
                expect(() => service.removeFrame(null)).toThrow(TypeError);
                expect(() => service.removeFrame(undefined)).toThrow(TypeError);
                expect(() => service.removeFrame(-1)).toThrow(TypeError);
                expect(() => service.removeFrame(1)).toThrow(TypeError);
            });

            it("Should throw a Error if the frameIndex does not exist in the frame array", () => {
                expect(() => service.removeFrame(1)).toThrow(Error);
            });

            it("Should decrease the current amount of frames to 0", () => {
                let count: number;

                service.addFrame("Frame 1");
                count = service.frameCount();
                expect(count).toBe(1);

                service.removeFrame(0);
                count = service.frameCount();
                expect(count).toBe(0);

            });

        }],
        ["addLayerToFrame", () => {
            let service = new ProjectService();

            it("Should throw a TypeError if frameName or layerName is not a valid string", () => {
                expect(() => service.addLayerToFrame(undefined, undefined)).toThrow(TypeError);
                expect(() => service.addLayerToFrame(null, undefined)).toThrow(TypeError);
                expect(() => service.addLayerToFrame(null, null)).toThrow(TypeError);
                expect(() => service.addLayerToFrame(0, null)).toThrow(TypeError);
                expect(() => service.addLayerToFrame(-1, null)).toThrow(TypeError);
                expect(() => service.addLayerToFrame(0, "")).toThrow(TypeError);
                expect(() => service.addLayerToFrame(-1, "")).toThrow(TypeError);
                expect(() => service.addLayerToFrame(null, "")).toThrow(TypeError);
                expect(() => service.addLayerToFrame(undefined, null)).toThrow(TypeError);
            });

            it("Should throw a error if the frame does not exist", () => {
                expect(() => service.addLayerToFrame(0, "Layer 1")).toThrow(Error);
            });

            service.addFrame("Test");

            let layerIndex = service.addLayerToFrame(0, "Layer 2");

            it("Should return the new layers index", () => {
                expect(layerIndex).toBe(1);
                layerIndex = service.addLayerToFrame(0, "Layer 3", LayerType.Vector);
                expect(layerIndex).toBe(2);
            });

        }],
        ["removeLayerFromFrame", () => {
            let service = new ProjectService();

            it("Should throw a TypeError when frameName and/or layerName is not a valid string with at least 1 character", () => {
                expect(() => service.removeLayerFromFrame(undefined, undefined)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(null, undefined)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(null, null)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(0, null)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(-1, null)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(0, 0)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(-1, 0)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(-1, -1)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(0, -1)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(null, 0)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(null, -1)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(undefined, 0)).toThrow(TypeError);
                expect(() => service.removeLayerFromFrame(undefined, -1)).toThrow(TypeError);
            });

            it("Should throw a error if the frameName and/or layerName is not valid", () => {
                expect(() => service.removeLayerFromFrame(0, 0)).toThrow(Error);
                service.addFrame("Frame 1");
                expect(() => service.removeLayerFromFrame(0, 1)).toThrow(Error);

                service.removeLayerFromFrame(0, 0);
            });

        }],
        ["getFrameLayer", () => {
            let service = new ProjectService();

            it("Should throw a TypeError with invalid parameters", () => {
                expect(() => service.getFrameLayer(null, null)).toThrow(TypeError);
                expect(() => service.getFrameLayer(undefined, null)).toThrow(TypeError);
                expect(() => service.getFrameLayer(undefined, undefined)).toThrow(TypeError);
                expect(() => service.getFrameLayer(0, undefined)).toThrow(TypeError);
                expect(() => service.getFrameLayer(0, 0)).toThrow(TypeError);
            });

            let frameIndex = service.addFrame("Test");

            let layerIndex = service.addLayerToFrame(frameIndex, "Layer 2");
            let layer = service.getFrameLayer(frameIndex, layerIndex);

            it("Should return a valid IPaintLayer with a Pixel Layer", () => {
                expect(layer.name).toBe("Layer 2");
                expect(layer.layerType).toBe(LayerType.Pixel);
                expect(layer.pixelData).toBeDefined();
                expect(layer.vectorData).toBeUndefined();

                //TODO test further default pixel data
            });

            layerIndex = service.addLayerToFrame(frameIndex, "Layer 3", LayerType.Vector);
            layer = service.getFrameLayer(frameIndex, layerIndex);

            it("Should return a valid IPaintLayer with a Vector Layer", () => {
                expect(layer.name).toBe("Layer 3");
                expect(layer.layerType).toBe(LayerType.Vector);
                expect(layer.vectorData).toBeDefined();
                expect(layer.pixelData).toBeUndefined();

                //TODO test further default vector data
            });

        }],
        ["getFrame", () => {
            let service = new ProjectService();

            service.addFrame("Test");

            let frame = service.getFrame(0);

            it("Should return a IPaintFrame object with correct default layer", () => {
                expect(frame.name).toBe("Test");
                expect(frame.layers.length).toBe(1);
            });

        }],
        ["frameCount", () => {
            let service = new ProjectService();

            it("Should have zero frames initially", () => {
                expect(service.frameCount()).toBe(0);
            });

            let frameIndex = service.addFrame("Test Frame");

            it("Should have 1 frame after adding a frame", () => {
                expect(service.frameCount()).toBe(1);
            });

            service.removeFrame(frameIndex);

            it("Should have a frame count of zero again after removing the frame", () => {
                expect(service.frameCount()).toBe(0);
            });

        }],
        ["frameLayerCount", () => {
            let service = new ProjectService();

            it("Should throw a TypeError if the frameIndex is not valid", () => {
                expect(() => service.frameLayerCount(null)).toThrow(TypeError);
                expect(() => service.frameLayerCount(undefined)).toThrow(TypeError);
                expect(() => service.frameLayerCount(0)).toThrow(TypeError);
                expect(() => service.frameLayerCount(-1)).toThrow(TypeError);
            });

            let frameIndex = service.addFrame("Frame 1");

            it("Should return 1 after adding a new frame", () => {
                expect(service.frameLayerCount(frameIndex)).toBe(1);
            });

            service.removeLayerFromFrame(frameIndex, 0);

            it("Should return 0 after removing the layer", () => {
                expect(service.frameLayerCount(frameIndex)).toBe(0);
            });

            service.addLayerToFrame(frameIndex, "Layer Test");

            it("Should return 1 after adding a new layer to the frame", () => {
                expect(service.frameLayerCount(frameIndex)).toBe(1);
            });
        }]
    ]
});