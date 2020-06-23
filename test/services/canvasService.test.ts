import { specification, it, expect } from "prototest";
import { CanvasService } from "../../src/js/services/CanvasService.js"

specification({
    title: "Canvas Service",
    authors: [
        "Maxwell DeVos"
    ],
    description: "",//TODO wrote before testing framework was created
    specs: [
        ["Canvas Service Initialization", () => {

            let service = new CanvasService();

            it("Should have x default value", () => {
                expect(service.x).toBe(0);
            });

            it("Should have y default value", () => {
                expect(service.y).toBe(0);
            });

            it("Should have width default value", () => {
                expect(service.width).toBe(500);
            });

            it("Should have height default value", () => {
                expect(service.height).toBe(500);
            });

            it("Should have originX default value", () => {
                expect(service.originX).toBe(0);
            });

            it("Should have originY default value", () => {
                expect(service.originY).toBe(0);
            });

            it("Should have scale default value", () => {
                expect(service.scale).toBe(1);
            });
        }],

        ["Canvas Service Pan", () => {
            let service = new CanvasService();
            service.pan(10, 10);

            it("Should pan horizontally 10px", () => {
                expect(service.x).toBe(10);
            });

            it("Should pan vertically 10px", () => {
                expect(service.y).toBe(10);
            });

            service.pan(0, 0);

            it("Should pan horizontally 0px", () => {
                expect(service.x).toBe(10);
            });

            it("Should pan vertically 0px", () => {
                expect(service.y).toBe(10);
            });

            service.pan(-10, -10);

            it("Should pan horizontally -10px", () => {
                expect(service.x).toBe(0);
            });

            it("Should pan vertically -10px", () => {
                expect(service.y).toBe(0);
            });
        }],
        ["Canvas Service Translation", () => {
            let service = new CanvasService();

            service.setTranslation(10, 10);
            it("Should have x position 10px", () => {
                expect(service.x).toBe(10);
            });

            it("Should have y position 10px", () => {
                expect(service.y).toBe(10);
            });

            service.setTranslation(0, 0);
            it("Should have x position 0px", () => {
                expect(service.x).toBe(0);
            });

            it("Should have y position 0px", () => {
                expect(service.y).toBe(0);
            });

            service.setTranslation(-10, -10);
            it("Should have x position -10px", () => {
                expect(service.x).toBe(-10);
            });

            it("Should have y position -10px", () => {
                expect(service.y).toBe(-10);
            });
        }],
        ["Canvas Service setOrigin", () => {
            let service = new CanvasService();

            service.setOrigin(10, 10);
            it("Should have originX 10", () => {
                expect(service.originX).toBe(10);
            });

            it("Should have originY 10", () => {
                expect(service.originY).toBe(10);
            });

            service.setOrigin(0, 0);
            it("Should have originX 0", () => {
                expect(service.originX).toBe(0);
            });

            it("Should have originY 0", () => {
                expect(service.originY).toBe(0);
            });

            service.setOrigin(-10, -10);
            it("Should have originX -10", () => {
                expect(service.originX).toBe(-10);
            });

            it("Should have originY -10", () => {
                expect(service.originY).toBe(-10);
            });
        }],
        ["Canvas Service Scale", () => {

            let service = new CanvasService();

            service.setScale(0);
            it("Should have a scale of 0 mapped to 0.25", () => {
                expect(service.scale).toBe(0.25);
            });

            service.setScale(5);
            it("Should have a scale of 5 mapped to 4", () => {
                expect(service.scale).toBe(4);
            });

            service.setScale(-1);
            it("Should have a scale of -1 mapped to 0.25", () => {
                expect(service.scale).toBe(0.25);
            });

            service.setScale(0.5);
            it("Should have a scale of 0.5", () => {
                expect(service.scale).toBe(0.5);
            });
        }],

        ["Canvas Service scaleFromPoint", () => {
            let service = new CanvasService();

            it("Should have an initial position and scale", () => {
                expect(service.x).toBe(0);
                expect(service.y).toBe(0);
                expect(service.scale).toBe(1);
            });

            service.scaleFromPoint(2, 0, 0);

            it("Should have only changed scale", () => {
                expect(service.x).toBe(0);
                expect(service.y).toBe(0);
                expect(service.scale).toBe(2);
            });

            service.scaleFromPoint(1, 0, 0);
            service.scaleFromPoint(2, 250, 250);

            it("Should be scaled by 2 and position be x: -250, Y: -250", () => {
                expect(service.x).toBe(-250);
                expect(service.y).toBe(-250);
                expect(service.scale).toBe(2);
            });

            service.scaleFromPoint(10, 0, 0);

            it("Should not scale by 10 or move", () => {
                expect(service.x).toBe(-250);
                expect(service.y).toBe(-250);
                expect(service.scale).toBe(2);
            });

            it("Should not scale by -1 or move", () => {
                expect(service.x).toBe(-250);
                expect(service.y).toBe(-250);
                expect(service.scale).toBe(2);
            });

        }]
    ]
});