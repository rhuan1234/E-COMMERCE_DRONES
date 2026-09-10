import { inject } from "@angular/core";
import { ResolveFn } from '@angular/router';
import { Camera } from "../models/Camera";
import { CameraService } from "../services/CameraService";

export const cameraResolver: ResolveFn<Camera> = (route, state) => {
  return inject(CameraService).findById(route.paramMap.get('id'));
};