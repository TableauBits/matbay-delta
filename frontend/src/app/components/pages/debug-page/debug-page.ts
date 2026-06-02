import { AfterViewChecked, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { CommonModule } from '@angular/common';
import { DeltaAuth } from '../../../services/delta-auth';
import { environment } from '../../../../environments/environment';
import { JsonEditor } from './json-editor/json-editor';
import { lastValueFrom } from 'rxjs';

interface RequestEntry {
  timestamp: Date;
  method: string;
  url: string;
  statusCode: number | null;
  duration: number;
  requestBody: string | null;
  responseBody: string | null;
  requestHeaders: Record<string, string> | null;
  responseHeaders: Record<string, string> | null;
  error: string | null;
  status: 'success' | 'error';
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

@Component({
  selector: 'app-debug-page',
  imports: [CommonModule, ReactiveFormsModule, JsonEditor],
  templateUrl: './debug-page.html',
  styleUrl: './debug-page.scss',
})
export class DebugPage implements AfterViewChecked {
  private http = inject(HttpClient);
  private deltaAuth = inject(DeltaAuth);
  private formBuilder = inject(FormBuilder);

  @ViewChild('consoleBody') private consoleBody!: ElementRef;
  private previousEntryCount = 0;

  debugForm: FormGroup;
  entries: RequestEntry[] = [];
  loading = false;
  showHeaders = false;

  httpMethods = HTTP_METHODS;
  baseUrl = `${environment.server.httpProtocol}${environment.server.domain}`;

  constructor() {
    this.debugForm = this.formBuilder.group({
      method: ['GET'],
      url: [''],
      headers: ['{\n  "Content-Type": "application/json"\n}'],
      body: ['{\n  \n}'],
      includeAuth: [true],
    });
  }

  ngAfterViewChecked(): void {
    if (this.entries.length > this.previousEntryCount) {
      this.scrollToBottom();
      this.previousEntryCount = this.entries.length;
    }
  }

  private scrollToBottom(): void {
    const el = this.consoleBody.nativeElement;
    el.scrollTop = el.scrollHeight;
  }

  async sendRequest(): Promise<void> {
    if (this.loading) return;

    const method = this.debugForm.get('method')?.value;
    const endpoint = this.debugForm.get('url')?.value;
    const headersRaw = this.debugForm.get('headers')?.value;
    const bodyRaw = this.debugForm.get('body')?.value;
    const includeAuth = this.debugForm.get('includeAuth')?.value;

    if (!endpoint) return;

    const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;

    let parsedHeaders: Record<string, string> = {};
    if (headersRaw?.trim()) {
      try {
        parsedHeaders = JSON.parse(headersRaw);
      } catch {
        this.addErrorEntry(method, url, 'Invalid JSON in headers', null);
        return;
      }
    }

    let parsedBody: unknown = null;
    if (bodyRaw?.trim()) {
      try {
        parsedBody = JSON.parse(bodyRaw);
      } catch {
        this.addErrorEntry(method, url, 'Invalid JSON in request body', null);
        return;
      }
    }

    if (includeAuth) {
      try {
        const token = await this.deltaAuth.getIdToken();
        parsedHeaders['delta-auth'] = token.__raw;
      } catch {
        this.addErrorEntry(method, url, 'Failed to retrieve auth token', null);
        return;
      }
    }

    this.loading = true;
    const startTime = performance.now();

    try {
      const response = await lastValueFrom(
        this.http.request(method, url, {
          body: parsedBody,
          headers: parsedHeaders,
          observe: 'response',
          responseType: 'text',
        }),
      );

      const duration = performance.now() - startTime;
      const responseHeaders: Record<string, string> = {};
      response.headers.keys().forEach((key) => {
        const val = response.headers.get(key);
        if (val) responseHeaders[key] = val;
      });

      this.entries.push({
        timestamp: new Date(),
        method,
        url,
        statusCode: response.status,
        duration,
        requestBody: bodyRaw || null,
        responseBody: response.body,
        requestHeaders: includeAuth || headersRaw ? parsedHeaders : null,
        responseHeaders,
        error: null,
        status: 'success',
      });
    } catch (err: unknown) {
      const duration = performance.now() - startTime;
      const httpError = err instanceof HttpErrorResponse ? err : null;

      const errorMessage = httpError ? httpError.message : 'Unknown error';
      const statusCode: number | null = httpError ? httpError.status : null;
      const responseBody: string | null = httpError ? httpError.error : null;
      const responseHeaders: Record<string, string> = {};

      if (httpError) {
        httpError.headers.keys().forEach((key) => {
          const val = httpError.headers.get(key);
          if (val) responseHeaders[key] = val;
        });
      }

      this.entries.push({
        timestamp: new Date(),
        method,
        url,
        statusCode,
        duration,
        requestBody: bodyRaw || null,
        responseBody,
        requestHeaders: includeAuth || headersRaw ? parsedHeaders : null,
        responseHeaders,
        error: errorMessage,
        status: 'error',
      });
    } finally {
      this.loading = false;
    }
  }

  private addErrorEntry(method: string, url: string, error: string, responseBody: string | null): void {
    this.entries.push({
      timestamp: new Date(),
      method,
      url,
      statusCode: null,
      duration: 0,
      requestBody: this.debugForm.get('body')?.value || null,
      responseBody,
      requestHeaders: null,
      responseHeaders: null,
      error,
      status: 'error',
    });
  }

  clearConsole(): void {
    this.entries = [];
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }

  copyRequestHeaders(entry: RequestEntry): void {
    if (entry.requestHeaders) {
      this.copyToClipboard(JSON.stringify(entry.requestHeaders, null, 2));
    }
  }

  copyResponseHeaders(entry: RequestEntry): void {
    if (entry.responseHeaders) {
      this.copyToClipboard(JSON.stringify(entry.responseHeaders, null, 2));
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  formatDuration(ms: number): string {
    return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;
  }

  getStatusColor(status: number | null): string {
    if (!status) return '#888';
    if (status >= 200 && status < 300) return '#4caf50';
    if (status >= 400 && status < 500) return '#fed057';
    if (status >= 500) return '#ef547b';
    return '#888';
  }

  getStatusText(status: number | null): string {
    if (!status) return 'N/A';
    return `${status} ${this.getStatusLabel(status)}`;
  }

  private getStatusLabel(status: number): string {
    const labels: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      204: 'No Content',
      301: 'Moved Permanently',
      302: 'Found',
      304: 'Not Modified',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      405: 'Method Not Allowed',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return labels[status] || '';
  }

  prettyPrint(json: string | null): string {
    if (!json) return '';
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  }
}
