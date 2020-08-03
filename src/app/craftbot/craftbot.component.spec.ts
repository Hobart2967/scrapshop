import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CraftbotComponent } from './craftbot.component';

describe('CraftbotComponent', () => {
  let component: CraftbotComponent;
  let fixture: ComponentFixture<CraftbotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CraftbotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CraftbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
