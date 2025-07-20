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

  public createAcessory(acessory: CreateAcessoryDTO): Observable<CreateAcessoryDTO> {
    const formData = this.buildFormData(acessory);
    return this.http.post<CreateAcessoryDTO>(this.url, formData);
  }

  public updateAcessory(id: number, acessory: CreateAcessoryDTO): Observable<CreateAcessoryDTO> {
    const formData = this.buildFormData(acessory);
    return this.http.put<CreateAcessoryDTO>(`${this.url}/${id}`, formData);
  }

  public deleteAcessory(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }

  private buildFormData(acessory: CreateAcessoryDTO): FormData {
    const formData = new FormData();

    formData.append('name', acessory.name);
    formData.append('price', acessory.price.toString().replace(',', '.'));
    formData.append('category', acessory.category);
    formData.append('description', acessory.description);
    acessory.pictures.forEach(file => {
      formData.append('pictures', file);
    });

    return formData;
  }
}
