import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { ReportManager } from '../../core/Report/report-manager';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'his-report-dimessi',
  imports: [Button, DatePipe, Message],
  templateUrl: './report-dimessi.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportDimessi {
  readonly reportManager = inject(ReportManager);
  readonly sortDirection = signal<SortDirection>('desc');
  readonly sortedAdmissions = computed(() => {
    const direction = this.sortDirection() === 'desc' ? -1 : 1;

    return [...this.reportManager.dischargedAdmissions()].sort(
      (first, second) =>
        (new Date(first.dataOraDimissione).getTime() -
          new Date(second.dataOraDimissione).getTime()) *
        direction,
    );
  });

  constructor() {
    this.reportManager.fetchDischargedAdmissions();
  }

  public toggleSortDirection(): void {
    this.sortDirection.update((direction) => (direction === 'desc' ? 'asc' : 'desc'));
  }
}
