import { Injectable } from '@angular/core';
import { LANGUAGE_CODES, LANGUAGE_NAMES } from './language-data';

interface Language {
  code: string;
  name: string;
}

const CUSTOM_LANGUAGES = new Map<string, Language>([
  ['Δ_ins', { code: 'Δ_ins', name: 'Instrumental' }],
  ['Δ_mhl', { code: 'Δ_mhl', name: 'Monster Hunter Language' }],
  ['Δ_nie', { code: 'Δ_nie', name: 'Chaos' }], //  NieR Language
  ['Δ_hut', { code: 'Δ_hut', name: 'Huttese' }],
]);

@Injectable({
  providedIn: 'root',
})
export class Languages {
  private languages: Language[];

  constructor() {
    this.languages = LANGUAGE_CODES.map((code) => ({
      code,
      name: this.getLanguageName(code),
    })).concat(Array.from(CUSTOM_LANGUAGES.values()));
  }

  getLanguages(): Language[] {
    return this.languages;
  }

  getLanguageName(code: string): string {
    if (CUSTOM_LANGUAGES.has(code)) {
      return CUSTOM_LANGUAGES.get(code)!.name;
    }

    return Object.hasOwn(LANGUAGE_NAMES, code) ? LANGUAGE_NAMES[code] : code;
  }
}
