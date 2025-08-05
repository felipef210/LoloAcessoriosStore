import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AcessoryDTO, CreateAcessoryDTO, FilterAcessoryDTO, UpdateAcessoryDTO } from '../interfaces/acessory.models';
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

  public updateAcessory(id: number, acessory: UpdateAcessoryDTO): Observable<UpdateAcessoryDTO> {
    const formData = this.buildFormDataToUpdateAcessory(acessory);
    return this.http.put<UpdateAcessoryDTO>(`${this.url}/${id}`, formData);
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
    formData.append('lastUpdate', acessory.lastUpdate.toISOString());
    acessory.pictures.forEach(file => {
      formData.append('pictures', file);
    });

    return formData;
  }

  private buildFormDataToUpdateAcessory(acessory: UpdateAcessoryDTO): FormData {
    const formData = new FormData();

    formData.append('name', acessory.name);
    formData.append('price', acessory.price.toString().replace(',', '.'));
    formData.append('category', acessory.category);
    formData.append('description', acessory.description);
    formData.append('lastUpdate', acessory.lastUpdate.toISOString());

    acessory.existingPictures.forEach(url => {
      formData.append('existingPictures', url);
    });

    acessory.newPictures.forEach(file => {
      formData.append('NewPictures', file);
    });

    return formData;
  }
}
