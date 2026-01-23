import { Source, SourcePlatform } from '../../../../common/source';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Sources {
  generateURL(source: Source): string {
    switch (source.platform) {
      case SourcePlatform.YOUTUBE:
        return `https://www.youtube.com/watch?v=${source.sourceID}`;
      default:
        throw new Error(`Unsupported source platform: ${source.platform}`);
    }
  }
}
