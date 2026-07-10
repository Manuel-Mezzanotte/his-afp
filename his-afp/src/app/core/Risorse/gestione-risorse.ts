import { inject, Injectable, signal } from '@angular/core';
import { ArrivalMode, Pathology, TriageColor } from './risorse.model';
import { HttpClient } from '@angular/common/http';
import { APIResponse } from '../models/APIResponse.model';

@Injectable({
  providedIn: 'root',
})
export class GestioneRisorse {
  readonly #http = inject(HttpClient);
  readonly #triageColors = signal<TriageColor[]>([]);
  triageColors = this.#triageColors.asReadonly();
  readonly #pathologies = signal<Pathology[]>([]);
  pathologies = this.#pathologies.asReadonly();
  readonly #arrivalModes = signal<ArrivalMode[]>([]);
  arrivalModes = this.#arrivalModes.asReadonly();

  public fetchRisorse() {
    this.fetchTriageColors();
    this.fetchPathology();
    this.fetchArrivalModes();
  }

  private fetchTriageColors() {
    this.#http
      .get<APIResponse<TriageColor[]>>('/api/resources/triage-colors')
      .subscribe({
        next: (res: APIResponse<TriageColor[]>) => {
          this.#triageColors.set(res.data);
        },
        error: (err) => {
          console.error('Errore durante il fetch dei colori del triage:', err);
        },
      });
  }
  private fetchPathology() {
    this.#http
      .get<APIResponse<Pathology[]>>('/api/resources/pathologies')
      .subscribe({
        next: (res) => {
          this.#pathologies.set(res.data);
        },
        error: (err) => {
          console.error('Errore durante il fetch delle patologie:', err);
        },
      });
  }
  private fetchArrivalModes() {
    this.#http
      .get<APIResponse<ArrivalMode[]>>('/api/resources/arrival-modes')
      .subscribe({
        next: (res) => {
          this.#arrivalModes.set(res.data);
        },
        error: (err) => {
          console.error('Errore durante il fetch delle modalità di arrivo:', err);
        },
      });
  }
}
