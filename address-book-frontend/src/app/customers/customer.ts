import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private api = environment.apiUrl + '/customers';

  constructor(private http: HttpClient) {}

  /* GET ALL */
  getAll(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.api}?page=${page}&limit=${limit}`);
  }

  /* GET BY ID */
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}`);
  }

  /* ADD */
  create(data: any): Observable<any> {
    return this.http.post<any>(this.api, data);
  }

  /* CHECK DUPLICATE ENTRY */
  checkDuplicate(name: string) {
    return this.http.get<any>(`${this.api}/check-duplicate?name=${encodeURIComponent(name)}`);
  }

  /* SEARCH */
  search(filter: any, page: number = 1, limit: number = 10): Observable<any> {
    return this.http.post<any>(`${this.api}/search?page=${page}&limit=${limit}`, filter);
  }

  /* UPDATE */
  update(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}`, data);
  }

  /* DELETE */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.api}/${id}`);
  }

  /* STATS */
  getStats(): Observable<any> {
    return this.http.get<any>(`${this.api}/stats/summary`);
  }

}