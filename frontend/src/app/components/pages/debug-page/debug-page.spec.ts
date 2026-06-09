import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugPage } from './debug-page';

describe('DebugPage', () => {
  let component: DebugPage;
  let fixture: ComponentFixture<DebugPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebugPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DebugPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
