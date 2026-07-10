import { inject, Injectable, signal } from '@angular/core';
import {
  PatientAdmission,
  PatientAdmissionRes,
  PatientSearch,
  PatientSearchResult,
  PatientSearchResultDto,
  Paziente,
  PazienteDTO,
} from './Pazienti.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { APIResponse } from '../models/APIResponse.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PatientManager {
  timer_id = signal<number>(-1);
  #http = inject(HttpClient);
  readonly #router = inject(Router);
  #listaPZ = signal<Paziente[]>([]);
  #listaPZFiltered = signal<Paziente[]>(this.#listaPZ());
  #searchResults = signal<PatientSearchResult[]>([]);
  #searchLoading = signal<boolean>(false);
  #searchError = signal<string | null>(null);
  #searchPerformed = signal<boolean>(false);
  #selectedPatient = signal<PatientSearchResult | null>(null);
  listaPZ = this.#listaPZFiltered.asReadonly();
  searchResults = this.#searchResults.asReadonly();
  searchLoading = this.#searchLoading.asReadonly();
  searchError = this.#searchError.asReadonly();
  searchPerformed = this.#searchPerformed.asReadonly();
  selectedPatient = this.#selectedPatient.asReadonly();

  // constructor() {
  //   this.fetchPazienti();
  // }

  /**
   * Creazione timer di t secondi
   */
  public refreshPazienti() {
    if (this.timer_id() >= 0) return;
    let id = setInterval(() => this.fetchPazienti(), 1000);
    this.timer_id.set(id);
  }

  public stopRefreshPazienti() {
    clearInterval(this.timer_id());
    this.timer_id.set(-1);
  }

  public fetchPazienti() {
    this.#http.get<APIResponse<PazienteDTO[]>>(`/api/admissions`).subscribe({
      next: (res) => {
        const pz = res.data.map((p) => this.mapPazienteDTOToPaziente(p));
        this.#listaPZ.set(pz);
      },
      error: (err) => {
        console.error('Errore durante il fetch dei pazienti:', err);
      },
    });
  }

  public searchPatients(search: PatientSearch): void {
    this.#searchLoading.set(true);
    this.#searchError.set(null);
    this.#searchPerformed.set(true);
    this.#searchResults.set([]);
    this.#selectedPatient.set(null);

    const params =
      'cf' in search
        ? new HttpParams().set('cf', search.cf)
        : new HttpParams()
            .set('nome', search.nome)
            .set('cognome', search.cognome)
            .set('data_nascita', search.dataNascita);

    this.#http
      .get<APIResponse<PatientSearchResultDto[]>>('/api/patients/search', { params })
      .subscribe({
        next: (res) => {
          this.#searchResults.set(res.data.map((patient) => this.mapSearchResult(patient)));
          this.#searchLoading.set(false);
        },
        error: () => {
          this.#searchError.set('Errore durante la ricerca del paziente');
          this.#searchLoading.set(false);
        },
      });
  }

  public selectPatient(patient: PatientSearchResult): void {
    this.#selectedPatient.set(patient);
  }

  public clearSearch(): void {
    this.#searchResults.set([]);
    this.#searchError.set(null);
    this.#searchPerformed.set(false);
    this.#selectedPatient.set(null);
  }

  public admitPatient(pz: PatientAdmission) {
    this.#http
      .post<APIResponse<PatientAdmissionRes>>(`${environment.apiUrl}/admissions`, pz)
      .subscribe({
        next: (res) => {
          this.#router.navigate([`/modifica-pz/${res.data.id}`]);
        },
        error: (err) => {
          console.error("Errore durante l'ammissione del paziente:", err);
        },
      });
  }

  public updatePatientInfo(pzId: number, residenza: Pick<PatientAdmission, 'residenza'>) {
    this.#http
      .patch<APIResponse<PatientAdmissionRes>>(`${environment.apiUrl}/patients/${pzId}`, residenza)
      .subscribe({
        next: (res) => {
          this.#router.navigate([`/lista-pz`]);
        },
        error: (err) => {
          console.error("Errore durante l'aggiornamento delle informazioni del paziente:", err);
        },
      });
  }

  public mapPazienteDTOToPaziente(pz: PazienteDTO): Paziente {
    return {
      id: pz.id.toString(),
      nome: pz.nome,
      cognome: pz.cognome,
      braccialetto: pz.braccialetto,
      codiceColore: pz.coloreCode,
      note: pz.noteTriage,
      patologia: pz.patologiaCode,
      eta: this.calcolaEta(pz.dataNascita),
    };
  }

  public calcolaEta(dataNascita: string): number {
    const today = new Date();
    const birthDate = new Date(dataNascita);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  public filterByName(name: string) {
    const filtered = this.#listaPZ().filter((p) => {
      const fullName = `${p.nome} ${p.cognome}`.toLowerCase();
      return fullName.includes(name.toLowerCase());
    });
    this.#listaPZFiltered.set(filtered);
  }

  private mapSearchResult(patient: PatientSearchResultDto): PatientSearchResult {
    return {
      id: patient.id,
      codiceFiscale: patient.codice_fiscale,
      nome: patient.nome,
      cognome: patient.cognome,
      dataNascita: patient.data_nascita,
      sesso: patient.sex,
      indirizzoVia: patient.indirizzo_via,
      indirizzoCivico: patient.indirizzo_civico,
      comune: patient.comune,
      provincia: patient.provincia,
    };
  }
}
