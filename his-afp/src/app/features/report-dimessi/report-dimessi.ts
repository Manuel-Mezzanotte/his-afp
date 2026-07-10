import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReportManager } from '../../core/Report/report-manager';

@Component({
  selector: 'his-report-dimessi',
  imports: [DatePipe],
  templateUrl: './report-dimessi.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDimessi {
  readonly reportManager = inject(ReportManager);

  constructor() {
    this.reportManager.fetchDischargedAdmissions();
  }
}
