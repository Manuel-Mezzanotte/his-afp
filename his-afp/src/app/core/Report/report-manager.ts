import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { APIResponse } from '../models/APIResponse.model';
import { DischargedAdmission } from './report.model';

@Injectable({
  providedIn: 'root',
})
export class ReportManager {
  readonly #http = inject(HttpClient);
  readonly #dischargedAdmissions = signal<DischargedAdmission[]>([]);
  readonly #loading = signal<boolean>(false);
  readonly #error = signal<string | null>(null);

  dischargedAdmissions = this.#dischargedAdmissions.asReadonly();
  loading = this.#loading.asReadonly();
  error = this.#error.asReadonly();

  public fetchDischargedAdmissions(): void {
    this.#loading.set(true);
    this.#error.set(null);

    this.#http
      .get<APIResponse<DischargedAdmission[]>>('/api/admissions/reports/discharged')
      .subscribe({
        next: (res) => {
          this.#dischargedAdmissions.set(res.data);
          this.#loading.set(false);
        },
        error: () => {
          this.#error.set('Errore durante il caricamento dei pazienti dimessi');
          this.#loading.set(false);
        },
      });
  }
}
