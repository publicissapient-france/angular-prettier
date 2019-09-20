import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent, WelcomeComponent],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render welcome component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const welcome: WelcomeComponent = fixture.debugElement.query(By.directive(WelcomeComponent)).componentInstance;
    expect(welcome).toBeTruthy();
  });
});
