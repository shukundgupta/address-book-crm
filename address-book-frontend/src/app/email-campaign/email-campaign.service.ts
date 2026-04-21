import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EmailCampaignService {

  private API = 'http://localhost:3000/api/email-campaigns';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getFilterOptions() {
    return this.http.get<any>(`${this.API}/filter-options`, { headers: this.getHeaders() });
  }

  previewCampaign(data: any) {
    return this.http.post<any>(`${this.API}/preview`, data, { headers: this.getHeaders() });
  }

  sendCampaign(data: any) {
    return this.http.post<any>(`${this.API}/send`, data, { headers: this.getHeaders() });
  }

  getHistory() {
    return this.http.get<any[]>(`${this.API}/history`, { headers: this.getHeaders() });
  }

  getCampaignDetail(id: number) {
    return this.http.get<any>(`${this.API}/history/${id}`, { headers: this.getHeaders() });
  }

  deleteCampaign(id: number) {
    return this.http.delete<any>(`${this.API}/history/${id}`, { headers: this.getHeaders() });
  }
}
