import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { Camera } from '../../../../core/models/Camera';
import { CameraService } from '../../../../core/services/CameraService';

@Component({
  imports: [MatTableModule, MatInputModule, MatFormFieldModule, 
            MatToolbarModule, MatButtonModule, MatIconModule, RouterLink
            ],
  selector: 'app-camera-list',
  styleUrl: './camera-list.css',
  templateUrl: './camera-list.html',
})
export class CameraList {

  displayedColumns: string[] = ['id', 'modelo', 'marca', 'resolucao', 'zoom', 'estabilizacao', 'fps', 'acao'];
  dataSource = new MatTableDataSource<Camera>();

  constructor (private cameraService: CameraService) {}

  ngOnInit(): void {
    this.cameraService.findAll().subscribe((cameras) => {
      this.dataSource.data = cameras;
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
