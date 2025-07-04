import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AcessoryDTO, FilterAcessoryDTO } from '../interfaces/acessory.models';

@Injectable({
  providedIn: 'root'
})
export class AcessoryService {

  constructor() { }

  private http = inject(HttpClient);
  private url = environment.apiURL + '/api/acessories'

  public getLanding(): Observable<AcessoryDTO[]> {
    return this.http.get<AcessoryDTO[]>(this.url);
  }

  filter(value: FilterAcessoryDTO): Observable<AcessoryDTO[]> {
    return this.http.post<AcessoryDTO[]>(`${this.url}/filter`, value);
  }

}
