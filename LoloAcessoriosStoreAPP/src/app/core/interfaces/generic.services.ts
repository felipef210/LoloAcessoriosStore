import { Observable } from "rxjs";
import { PaginationDTO } from "./paginationDTO";
import { HttpResponse } from "@angular/common/http";

export interface IGENERICService<TDTO> {
  getPaginated(pagination: PaginationDTO): Observable<HttpResponse<TDTO[]>>;
  getById(selector: number | string): Observable<TDTO>;
  delete(selector: number | string): Observable<any>;
}
