import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HealthStatus, healthStatusMock } from './HealthStatus.model';
import { APIResponse } from '../models/APIResponse.model';

@Injectable({
  providedIn: 'root',
})
export class SystemStatus {
  #http = inject(HttpClient);
  #statoAPI = signal<HealthStatus>(healthStatusMock);

  statoAPI = this.#statoAPI.asReadonly();

  constructor() {
    this.fetchStatoAPI();
  }

  public fetchStatoAPI() {
    this.#http.get<APIResponse<HealthStatus>>('/api/health').subscribe({
      next: (res) => {
        this.#statoAPI.set(res.data);
      },
      error: () => {
        this.#statoAPI.set(healthStatusMock);
      },
    });
  }
}
