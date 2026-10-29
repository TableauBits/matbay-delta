import { Injectable } from '@angular/core';
import { LANGUAGE_OPTIONS } from './language-data';

interface Language {
  code: string;
  name: string;
}

const CUSTOM_LANGUAGES: Language[] = [
  { code: 'Δ_ins', name: 'Instrumental' },
  { code: 'Δ_mhl', name: 'Monster Hunter Language' },
  { code: 'Δ_nie', name: 'Chaos' }, // NieR Language
  { code: 'Δ_hut', name: 'Huttese' },
];

@Injectable({
  providedIn: 'root',
})
export class Languages {
  private languages: Language[] = [
    ...Object.entries(LANGUAGE_OPTIONS).map(([code, name]) => ({ code, name })),
    ...CUSTOM_LANGUAGES,
  ];

  getLanguages(): Language[] {
    return this.languages;
  }

  getLanguageName(code: string): string {
    return this.languages.find((language) => language.code === code)?.name ?? code;
  }
}
