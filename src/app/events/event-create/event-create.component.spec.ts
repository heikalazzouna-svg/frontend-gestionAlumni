import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventCreateComponent } from './event-create.component';
import { EventService } from '../event.service';
import { Router } from '@angular/router';

const fakeRouter = { navigate: jasmine.createSpy('navigate') };

describe('EventCreateComponent', () => {
  let component: EventCreateComponent;
  let fixture: ComponentFixture<EventCreateComponent>;
  let mockService: Partial<EventService>;

  beforeEach(async () => {
    mockService = {
      addEvent: jasmine.createSpy('addEvent')
    };

    await TestBed.configureTestingModule({
      imports: [EventCreateComponent],
      providers: [
        { provide: EventService, useValue: mockService },
        { provide: Router, useValue: fakeRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call addEvent on submit', () => {
    component.event = { title: 'A', description: '', type: 'Forums entreprises' as any, date: '', duration: '', location: '', format: 'présentiel', seats: 10 };
    component.onSubmit();
    expect(mockService.addEvent).toHaveBeenCalled();
    expect(fakeRouter.navigate).toHaveBeenCalledWith(['/events']);
  });
});