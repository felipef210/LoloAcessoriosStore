import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AcessoryDTO, FilterAcessoryDTO } from '../interfaces/acessory.models';
import { PaginationDTO } from '../interfaces/paginationDTO';
import { buildQueryParams } from '../../shared/functions/buildQueryParams';

@Injectable({
  providedIn: 'root'
})
export class AcessoryService {

  constructor() { }

  private http = inject(HttpClient);
  private url = environment.apiURL + '/api/acessories'

  public getLanding(pagination: PaginationDTO): Observable<HttpResponse<AcessoryDTO[]>> {
    let queryParams = buildQueryParams(pagination);
    return this.http.get<AcessoryDTO[]>(this.url, {params: queryParams, observe: 'response'});
  }

  public filter(value: FilterAcessoryDTO): Observable<HttpResponse<AcessoryDTO[]>> {
    const queryParams = buildQueryParams(value);
    return this.http.get<AcessoryDTO[]>(`${this.url}/filter`, {
      params: queryParams,
      observe: 'response'
    });
  }
}
