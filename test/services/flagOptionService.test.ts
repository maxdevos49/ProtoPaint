import { it, expect, specification } from "prototest";
import { FlagOptionService, IFlagSuggestion } from "../../src/js/services/FlagOptionService.js";

specification({
    title: "Flag Option Service",
    authors: ["Maxwell DeVos"],
    description: "",//TODO was written before testing framework
    specs: [
        ["flagOptionsService registerOptions", () => {

            let service = new FlagOptionService();

            const flagOption: IFlagSuggestion<any> = {
                name: null,
                sourceSelector: null,
                formatterSelector: null
            };

            it("Should throw when passed null", () => {
                expect(() => service.registerOptions(null)).toThrow(TypeError);
            });

            it("Should throw when name option is null or undefined", () => {
                expect(() => service.registerOptions(flagOption)).toThrow(TypeError);
            });

            flagOption.name = "Test Flag Option";

            it("Should throw when sourceSelector option is null or undefined", () => {
                expect(() => service.registerOptions(flagOption)).toThrow(TypeError);
            });

            flagOption.sourceSelector = () => [];

            it("Should throw when formatterSelector option is null or undefined", () => {
                expect(() => service.registerOptions(flagOption)).toThrow(TypeError);
            });
        }],

        ["flagOptionsService getOptions", () => {

            let service = new FlagOptionService();

            const flagOption: IFlagSuggestion<any> = {
                name: Boolean.name,
                sourceSelector: () => [true, false],
                formatterSelector: (value: boolean) => ({ value: value + "" })
            };

            it("Should throw a TypeError when passed null or undefined", () => {
                expect(() => service.getOptions(null)).toThrow(TypeError);
            });

            // service.registerOptions(flagOption);
            // console.log(service.getOptions(flagOption.name))
            it("Should return a IDataPart array", () => {
                expect(service.getOptions(flagOption.name)).toBeDefined();
            });

        }]
    ]
});