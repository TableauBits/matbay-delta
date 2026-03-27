import { buildDate, commitHash, version } from '../../environments/version';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Version {
  get major(): number {
    const prefixMajor = version.split('.')[0];
    return parseInt(prefixMajor.substring(1), 10);
  }

  get minor(): number {
    return parseInt(version.split('.')[1] ?? '-1', 10);
  }

  get patch(): number {
    const patchSuffix = version.split('.')[2] ?? '-1';
    return parseInt(patchSuffix.split('-')[0], 10);
  }

  get commitHash(): string {
    return commitHash;
  }

  get buildDate(): Date {
    return new Date(buildDate);
  }

  string(): string {
    return version;
  }

  fullString(): string {
    return `${version} (${commitHash}), built on: ${buildDate}`;
  }
}
