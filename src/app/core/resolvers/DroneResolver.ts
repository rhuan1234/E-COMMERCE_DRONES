import { ResolveFn } from "@angular/router";
import { Drone } from "../models/drone/Drone";
import { DroneService } from "../services/DroneService";
import { inject } from "@angular/core/primitives/di";

export const droneResolver: ResolveFn<Drone> = route => {
    return inject(DroneService).findById(route.paramMap.get('id'));
}