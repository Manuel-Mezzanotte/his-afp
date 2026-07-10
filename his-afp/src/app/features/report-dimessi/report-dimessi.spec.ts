import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DischargedAdmission } from '../../core/Report/report.model';
import { ReportManager } from '../../core/Report/report-manager';
import { ReportDimessi } from './report-dimessi';

class ReportManagerMock {
  readonly #admissions = signal<DischargedAdmission[]>([
    {
      braccialetto: '2026-0001',
      nome: 'Mario',
      cognome: 'Rossi',
      dataOraIngresso: '2026-07-10T08:00:00.000Z',
      dataOraDimissione: '2026-07-10T09:00:00.000Z',
    },
    {
      braccialetto: '2026-0002',
      nome: 'Anna',
      cognome: 'Bianchi',
      dataOraIngresso: '2026-07-10T10:00:00.000Z',
      dataOraDimissione: '2026-07-10T11:00:00.000Z',
    },
  ]);
  readonly dischargedAdmissions = this.#admissions.asReadonly();
  readonly loading = signal<boolean>(false).asReadonly();
  readonly error = signal<string | null>(null).asReadonly();

  public fetchDischargedAdmissions(): void {}
}

describe('ReportDimessi', () => {
  let component: ReportDimessi;
  let fixture: ComponentFixture<ReportDimessi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDimessi],
      providers: [{ provide: ReportManager, useClass: ReportManagerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportDimessi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should sort discharged admissions from newest to oldest by default', () => {
    expect(component.sortedAdmissions().map((admission) => admission.braccialetto)).toEqual([
      '2026-0002',
      '2026-0001',
    ]);
  });

  it('should reverse the discharge time sorting', () => {
    component.toggleSortDirection();

    expect(component.sortedAdmissions().map((admission) => admission.braccialetto)).toEqual([
      '2026-0001',
      '2026-0002',
    ]);
  });
});
