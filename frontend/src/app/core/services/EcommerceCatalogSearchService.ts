import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EcommerceCatalogSearchService {
  private readonly searchTermSubject = new BehaviorSubject('');
  readonly searchTerm$ = this.searchTermSubject.asObservable();

  search(term: string): void {
    this.searchTermSubject.next(term.trim());
  }
}
