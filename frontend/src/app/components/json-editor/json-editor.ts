/* eslint-disable sort-imports */
import {
  AfterViewInit,
  Component,
  ElementRef,
  forwardRef,
  inject,
  Input,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { indentWithTab } from '@codemirror/commands';
import { json, jsonParseLinter } from '@codemirror/lang-json';
import { lintGutter, linter } from '@codemirror/lint';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';

/**
 * Reusable JSON code editor wrapping CodeMirror 6.
 *
 * Implements ControlValueAccessor so it drops into Reactive Forms via
 * `formControlName`, exactly like a native textarea. Provides syntax
 * highlighting, bracket matching, auto-closing brackets and live JSON lint
 * markers, themed with One Dark.
 */
@Component({
  selector: 'app-json-editor',
  template: '<div #host class="json-editor-host"></div>',
  styleUrl: './json-editor.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JsonEditor),
      multi: true,
    },
  ],
})
export class JsonEditor implements AfterViewInit, OnDestroy, ControlValueAccessor {
  private zone = inject(NgZone);

  @ViewChild('host') private host!: ElementRef<HTMLDivElement>;

  @Input() placeholder = '';
  @Input() minHeight = '8rem';

  private view: EditorView | null = null;
  private readonly editableCompartment = new Compartment();

  /** Holds the value written before the view exists (writeValue can fire early). */
  private pendingValue = '';
  private disabled = false;

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.view = new EditorView({
        parent: this.host.nativeElement,
        state: EditorState.create({
          doc: this.pendingValue,
          extensions: [
            basicSetup,
            // Tab indents within the editor instead of moving focus to the next
            // element. Placed after basicSetup so it takes precedence for Tab.
            keymap.of([indentWithTab]),
            json(),
            linter(jsonParseLinter()),
            lintGutter(),
            oneDark,
            cmPlaceholder(this.placeholder),
            EditorView.theme({
              '&': { fontSize: '0.85rem', borderRadius: '4px' },
              // minHeight on the content (not the scroller) makes the whole
              // editor area clickable to place the cursor, not just the lines
              // that contain text.
              '.cm-content': { fontFamily: 'monospace', minHeight: this.minHeight },
              '&.cm-focused': { outline: 'none' },
            }),
            this.editableCompartment.of(EditorView.editable.of(!this.disabled)),
            EditorView.updateListener.of((update) => {
              if (update.docChanged) {
                const value = update.state.doc.toString();
                this.zone.run(() => this.onChange(value));
              }
              if (update.focusChanged && !update.view.hasFocus) {
                this.zone.run(() => this.onTouched());
              }
            }),
          ],
        }),
      });
    });
  }

  ngOnDestroy(): void {
    this.view?.destroy();
    this.view = null;
  }

  writeValue(value: string | null): void {
    const next = value ?? '';
    if (!this.view) {
      this.pendingValue = next;
      return;
    }
    const current = this.view.state.doc.toString();
    if (current === next) return;
    this.view.dispatch({
      changes: { from: 0, to: current.length, insert: next },
    });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.view?.dispatch({
      effects: this.editableCompartment.reconfigure(EditorView.editable.of(!isDisabled)),
    });
  }
}
