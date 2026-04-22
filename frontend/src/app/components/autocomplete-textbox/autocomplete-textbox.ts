import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

export interface AutocompleteResult {
  id: number;
  name: string;
}

@Component({
  selector: 'app-autocomplete-textbox',
  imports: [ReactiveFormsModule],
  templateUrl: './autocomplete-textbox.html',
  styleUrl: './autocomplete-textbox.scss',
})
export class AutocompleteTextbox implements OnDestroy {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() searchFn: (query: string) => Promise<AutocompleteResult[]> = () => Promise.resolve([]);

  @Output() resultSelected = new EventEmitter<AutocompleteResult | null>();

  searchControl = new FormControl<string>('', { nonNullable: true });

  results: AutocompleteResult[] = [];
  isLoading = false;
  isDropdownOpen = false;
  activeIndex = -1;

  private searchSubject = new Subject<string>();
  private subscriptions: Subscription = new Subscription();

  constructor() {
    const searchSub = this.searchControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap((query) => {
          if (query.trim().length === 0) {
            this.results = [];
            this.isDropdownOpen = false;
            this.isLoading = false;
            this.resultSelected.emit(null);
          } else {
            this.isLoading = true;
            this.isDropdownOpen = true;
          }
        }),
        debounceTime(1000),
        switchMap((query) => {
          if (query.trim().length === 0) return of([]);
          return this.searchFn(query.trim());
        }),
      )
      .subscribe((results) => {
        this.results = results;
        this.isLoading = false;
        this.activeIndex = -1;
      });

    this.subscriptions.add(searchSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.searchSubject.unsubscribe();
  }

  onKeydown(event: KeyboardEvent): void {
    const totalItems = this.getTotalItemCount();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (totalItems > 0) {
          this.activeIndex = (this.activeIndex + 1) % totalItems;
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (totalItems > 0) {
          this.activeIndex = this.activeIndex <= 0 ? totalItems - 1 : this.activeIndex - 1;
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex >= 0 && totalItems > 0) {
          this.selectItem(this.activeIndex);
        }
        break;
      case 'Escape':
        this.isDropdownOpen = false;
        break;
    }
  }

  onBlur(): void {
    setTimeout(() => {
      this.isDropdownOpen = false;
    }, 200);
  }

  onFocus(): void {
    if (this.searchControl.value.trim().length > 0) {
      this.isDropdownOpen = true;
    }
  }

  selectItem(index: number): void {
    const query = this.searchControl.value.trim();
    if (index === 0) {
      this.resultSelected.emit({ id: -1, name: query });
    } else if (index <= this.results.length) {
      this.resultSelected.emit(this.results[index - 1]);
    }
    this.isDropdownOpen = false;
  }

  getDisplayResults(): { result: AutocompleteResult | null; isVerbatim: boolean }[] {
    const query = this.searchControl.value.trim();
    if (!query) return [];
    const verbatim: { result: null; isVerbatim: true } = { result: null, isVerbatim: true };
    const matches = this.results.map((r) => ({ result: r, isVerbatim: false as const }));
    return [verbatim, ...matches];
  }

  getTotalItemCount(): number {
    const query = this.searchControl.value.trim();
    if (!query) return 0;
    return 1 + this.results.length;
  }

  highlightMatch(text: string, query: string): { text: string; isMatch: boolean }[] {
    if (!query) return [{ text, isMatch: false }];

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const segments: { text: string; isMatch: boolean }[] = [];

    let lastIndex = 0;
    let searchIndex = 0;

    while (searchIndex < lowerText.length) {
      const matchIndex = lowerText.indexOf(lowerQuery, searchIndex);
      if (matchIndex === -1) {
        segments.push({ text: text.slice(lastIndex), isMatch: false });
        break;
      }

      if (matchIndex > lastIndex) {
        segments.push({ text: text.slice(lastIndex, matchIndex), isMatch: false });
      }

      segments.push({ text: text.slice(matchIndex, matchIndex + query.length), isMatch: true });
      lastIndex = matchIndex + query.length;
      searchIndex = lastIndex;
    }

    return segments;
  }

  getItemId(index: number): string {
    if (index === 0) return 'verbatim';
    return `result-${index - 1}`;
  }
}
