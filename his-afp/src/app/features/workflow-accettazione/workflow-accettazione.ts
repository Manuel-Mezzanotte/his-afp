import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import { AccettazionePz } from '../accettazione-pz/accettazione-pz';
import { RicercaPaziente } from '../ricerca-paziente/ricerca-paziente';

@Component({
  selector: 'his-workflow-accettazione',
  imports: [AccettazionePz, RicercaPaziente],
  templateUrl: './workflow-accettazione.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowAccettazione {
  readonly patientManager = inject(PatientManager);
  readonly newPatient = signal<boolean>(false);
  readonly showForm = computed(() => this.patientManager.selectedPatient() !== null || this.newPatient());

  public onPatientSelected(): void {
    this.newPatient.set(false);
  }

  public onNewPatientRequested(): void {
    this.patientManager.clearSearch();
    this.newPatient.set(true);
  }
}
