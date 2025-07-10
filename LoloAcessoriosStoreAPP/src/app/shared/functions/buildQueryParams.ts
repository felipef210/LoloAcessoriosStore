import { HttpParams } from "@angular/common/http";

export function buildQueryParams(obj: Record<string, any>): HttpParams {
  let params = new HttpParams();

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      if (value !== null && value !== undefined && value !== '') {
        params = params.append(key, value.toString());
      }
    }
  }

  return params;
}
