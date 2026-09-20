import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Camera } from "../models/Camera";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class CameraService {
    private readonly apiUrl = 'http://localhost:8080/cameras/admin';

    constructor(private http: HttpClient) { }
    
    findAll(): Observable<Camera[]> {
        return this.http.get<Camera[]>(this.apiUrl);
    }
    
    findById(id: any): Observable<Camera> {
        return this.http.get<Camera>(`${this.apiUrl}/${id}`);
    }
    
    create(camera: Camera): Observable<Camera> {
        return this.http.post<Camera>(this.apiUrl, camera);
    }
    
    update(id: any, camera: Camera): Observable<Camera> {
        return this.http.put<Camera>(`${this.apiUrl}/${id}`, camera);
    }

    delete(id: any): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}