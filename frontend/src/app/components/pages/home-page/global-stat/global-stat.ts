import { Component, inject, signal } from '@angular/core';
import { HttpRequests } from '../../../../services/requests/http-requests';
import { GlobalStats } from '../../../../../../../common/stat';

@Component({
  imports: [],
  selector: 'app-global-stat',
  templateUrl: './global-stat.html',
})
export class GlobalStat {
  // Service injections
  private httpRequests = inject(HttpRequests);

  stats = signal<GlobalStats | null>(null);

  constructor() {
    this.httpRequests.authenticatedGetRequest<GlobalStats>('stat/global').then((stats) => {
      // this.stats = stats;
      this.stats.set(stats);
      console.log('global stats:', stats);
    });
  }
}
