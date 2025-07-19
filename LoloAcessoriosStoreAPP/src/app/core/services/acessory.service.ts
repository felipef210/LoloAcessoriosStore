import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AcessoryDTO, CreateAcessoryDTO, FilterAcessoryDTO } from '../interfaces/acessory.models';
import { PaginationDTO } from '../interfaces/paginationDTO';
import { buildQueryParams } from '../../shared/functions/buildQueryParams';

@Injectable({
  providedIn: 'root'
})
export class AcessoryService {

  constructor() { }

  private http = inject(HttpClient);
  private readonly url = environment.apiURL + '/api/acessories'

  public getLanding(pagination: PaginationDTO): Observable<HttpResponse<AcessoryDTO[]>> {
    let queryParams = buildQueryParams(pagination);
    return this.http.get<AcessoryDTO[]>(this.url, {params: queryParams, observe: 'response'});
  }

  public filter(filters: FilterAcessoryDTO, pagination: PaginationDTO): Observable<HttpResponse<AcessoryDTO[]>> {
    const queryParams = buildQueryParams({...filters, ...pagination});
    return this.http.get<AcessoryDTO[]>(`${this.url}/filter`, {
      params: queryParams,
      observe: 'response'
    });
  }

  public getAcessoryById(id: number): Observable<AcessoryDTO> {
    return this.http.get<AcessoryDTO>(`${this.url}/${id}`);
  }

  public createAcessory(acessory: CreateAcessoryDTO): Observable<any> {
    return this.http.post(this.url, acessory);
  }


  public updateAcessory(id: number, acessory: CreateAcessoryDTO): Observable<any> {
    return this.http.put(`${this.url}/${id}`, acessory);
  }
}
