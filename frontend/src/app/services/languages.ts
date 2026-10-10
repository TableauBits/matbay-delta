import { Injectable } from '@angular/core';
import { getAll639_2T, getName } from 'all-iso-language-codes';


type Language = {
  code: string;
  name: string;
};

const CUSTOM_LANGUAGES: Map<string, Language> = new Map([
  ["Δ_ins", { code: "Δ_ins", name: "Instrumental" }],
  ["∆_mhl", { code: "∆_mhl", name: "Monster Hunter Language" }],
  ["∆_nie", { code: "∆_nie", name: "Chaos" }],  //  NieR Language
  ["∆_hut", { code: "∆_hut", name: "Huttese" }], 
]);


@Injectable({
  providedIn: 'root',
})
export class Languages {
  private languages: Language[];

  constructor() {
    const codes = getAll639_2T();
    this.languages = codes.map((code) => ({
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

    const name = getName(code, "fr");
    if (!name) return code;
  
    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}


