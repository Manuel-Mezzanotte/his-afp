import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import { PatientSearchResult } from '../../core/Pazienti/Pazienti.model';

type SearchMode = 'fiscalCode' | 'personalData';

@Component({
  selector: 'his-ricerca-paziente',
  imports: [Button, DatePicker, DatePipe, InputText, Message, ReactiveFormsModule],
  templateUrl: './ricerca-paziente.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RicercaPaziente {
  readonly patientManager = inject(PatientManager);
  readonly searchMode = signal<SearchMode>('fiscalCode');
  readonly formError = signal<string | null>(null);
  readonly maxDate = new Date();

  readonly #fb = inject(FormBuilder);
  readonly searchForm = this.#fb.group({
    codiceFiscale: ['', [Validators.pattern('^[A-Za-z0-9]{16}$')]],
    nome: [''],
    cognome: [''],
    dataNascita: [null as Date | null],
  });

  public setSearchMode(mode: SearchMode): void {
    this.searchMode.set(mode);
    this.formError.set(null);
    this.patientManager.clearSearch();
  }

  public search(): void {
    this.formError.set(null);

    if (this.searchMode() === 'fiscalCode') {
      const codiceFiscale = this.searchForm.controls.codiceFiscale.value?.trim().toUpperCase() ?? '';

      if (!codiceFiscale || this.searchForm.controls.codiceFiscale.invalid) {
        this.searchForm.controls.codiceFiscale.markAsTouched();
        this.formError.set('Inserire un codice fiscale valido.');
        return;
      }

      this.patientManager.searchPatients({ cf: codiceFiscale });
      return;
    }

    const nome = this.searchForm.controls.nome.value?.trim() ?? '';
    const cognome = this.searchForm.controls.cognome.value?.trim() ?? '';
    const dataNascita = this.searchForm.controls.dataNascita.value;

    if (!nome || !cognome || !dataNascita) {
      this.searchForm.controls.nome.markAsTouched();
      this.searchForm.controls.cognome.markAsTouched();
      this.searchForm.controls.dataNascita.markAsTouched();
      this.formError.set('Nome, cognome e data di nascita sono obbligatori.');
      return;
    }

    this.patientManager.searchPatients({
      nome,
      cognome,
      dataNascita: this.formatDate(dataNascita),
    });
  }

  public selectPatient(patient: PatientSearchResult): void {
    this.patientManager.selectPatient(patient);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
