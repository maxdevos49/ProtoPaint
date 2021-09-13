import { service } from "../../lib/dependency-injection/js/DependencyInjection.js";
import { ProjectService } from "./ProjectService.js";


@service()
export class PixelDrawingService {

    private readonly _project: ProjectService;

    constructor(projectService: ProjectService) {
        this._project = projectService;
    }

    public activate(x: number, y: number) {

        console.log(x, y);
        
    }

}