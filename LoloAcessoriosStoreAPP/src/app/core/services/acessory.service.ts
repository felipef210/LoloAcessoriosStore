import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AcessoryDTO, FilterAcessoryDTO } from '../interfaces/acessory.models';
import { PaginatedDTO } from '../interfaces/paginated';

@Injectable({
  providedIn: 'root'
})
export class AcessoryService {

  constructor() { }

  private http = inject(HttpClient);
  private url = environment.apiURL + '/api/acessories'

  public getLanding(page: number): Observable<PaginatedDTO<AcessoryDTO>> {
    return this.http.get<PaginatedDTO<AcessoryDTO>>(`${this.url}?page=${page}`);
  }

  filter(value: FilterAcessoryDTO): Observable<AcessoryDTO[]> {
    return this.http.post<AcessoryDTO[]>(`${this.url}/filter`, value);
  }

}
