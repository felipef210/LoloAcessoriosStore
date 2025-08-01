import { AuthenticationResponseDTO } from './../../shared/security/security.models';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateUserDTO, LoginDTO, UpdateOwnProfileDTO, UpdateProfileDTO, UserProfileDTO } from '../interfaces/user.models';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { buildQueryParams } from '../../shared/functions/buildQueryParams';
import { PaginationDTO } from '../interfaces/paginationDTO';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor() { }

  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly url = environment.apiURL + '/api/users';
  private readonly keyToken = 'token';
  private readonly keyExpiration = 'token-expiration;'

  getUsersPaginated(pagination: PaginationDTO): Observable<HttpResponse<UserProfileDTO[]>> {
    let queryParams = buildQueryParams(pagination);
    return this.http.get<UserProfileDTO[]>(this.url, {params: queryParams, observe: 'response'});
  }

  getUserByEmail(email: string): Observable<UserProfileDTO> {
    return this.http.get<UserProfileDTO>(`${this.url}/admin/getuser/${email}`);
  }

  getOwnProfile(): Observable<UserProfileDTO> {
    return this.http.get<UserProfileDTO>(`${this.url}/getuser`);
  }

  updateOwnProfile(user: UpdateOwnProfileDTO): Observable<AuthenticationResponseDTO> {
    return this.http.put<AuthenticationResponseDTO>(`${this.url}/edit-user`, user);
  }

  updateProfile(email: string, user: UpdateProfileDTO) {
    return this.http.put(`${this.url}/admin/edit-user/${email}`, user)
  }

  register(credentials: CreateUserDTO): Observable<AuthenticationResponseDTO> {
    return this.http.post<AuthenticationResponseDTO>(`${this.url}/register`, credentials)
    .pipe(
      tap(response => this.storeToken(response))
    );
  }

  login(credentials: LoginDTO): Observable<AuthenticationResponseDTO> {
    return this.http.post<AuthenticationResponseDTO>(`${this.url}/login`, credentials)
    .pipe(
      tap(response => this.storeToken(response))
    );
  }

  makeAdmin(email: string) {
    return this.http.post(`${this.url}/makeadmin`, {email});
  }

  removeAdmin(email: string) {
    return this.http.post(`${this.url}/removeadmin`, {email});
  }

  storeToken(authenticationResponse: AuthenticationResponseDTO) {
    localStorage.setItem(this.keyToken, authenticationResponse.token);
    localStorage.setItem(this.keyExpiration, authenticationResponse.expiration.toString());
  }

  getJWTToken(): string | null {
    return localStorage.getItem(this.keyToken);
  }

  getJWTClaim(field: string): string {
    const token = this.getJWTToken();

    if(!token)
      return '';

    const dataToken = JSON.parse(atob(token.split('.')[1]));
    return dataToken[field];
  }

  isLoggedIn(): boolean {
    const token = this.getJWTToken();

    if(!token)
      return false;

    const expiration = localStorage.getItem(this.keyExpiration)!;
    const expirationDate = new Date(expiration);

    if(expirationDate < new Date()) {
      this.logout();
      return false;
    }

    return true;
  }

  logout() {
    localStorage.removeItem(this.keyExpiration);
    localStorage.removeItem(this.keyToken);
    this.router.navigate(['/']);
  }

  getRole(): string {
    const isAdmin = this.getJWTClaim('isadmin');

    if(isAdmin)
      return 'admin';

    return '';
  }
}
