import { HttpParams } from "@angular/common/http";

export function buildQueryParams(obj: any): HttpParams {
  let queryParams = new HttpParams();

  for (let key in obj) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
      queryParams = queryParams.append(key, obj[key]);
    }
  }

  return queryParams;
}
