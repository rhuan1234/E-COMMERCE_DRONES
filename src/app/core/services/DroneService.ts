import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Drone } from "../models/drone/Drone";
import { Observable } from "rxjs";

@Injectable({providedIn: 'root'})
export class DroneService {
    private readonly apiUrl = 'http://localhost:8080/drones/admin';

    constructor(private http: HttpClient) { }
    
    findAll(): Observable<Drone[]> {
        return this.http.get<Drone[]>(this.apiUrl);
    }
    
    findById(id: any): Observable<Drone> {
        return this.http.get<Drone>(`${this.apiUrl}/${id}`);
    }
    
    create(droneRequest: Drone): Observable<Drone> {
        return this.http.post<Drone>(this.apiUrl, droneRequest);
    }
    
    update(id: any, droneRequest: Drone): Observable<Drone> {
        return this.http.put<Drone>(`${this.apiUrl}/${id}`, droneRequest);
    }

    delete(id: any): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}