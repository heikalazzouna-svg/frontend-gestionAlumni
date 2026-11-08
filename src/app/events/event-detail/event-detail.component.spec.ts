import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventDetailComponent } from './event-detail.component';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../event.service';
import { RouterTestingModule } from '@angular/router/testing';

const fakeRoute = { snapshot: { paramMap: { get: () => '1' } } } as any;

describe('EventDetailComponent', () => {
  let component: EventDetailComponent;
  let fixture: ComponentFixture<EventDetailComponent>;
  let mockService: Partial<EventService>;

  beforeEach(async () => {
    mockService = {
      getEvent: () => ({ id: 1, title: 'Test', description: '', type: 'Forums entreprises' as any, date: '', duration: '', location: '', format: 'présentiel', seats: 0 })
    };

    await TestBed.configureTestingModule({
      imports: [EventDetailComponent, RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: fakeRoute },
        { provide: EventService, useValue: mockService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the event', () => {
    expect(component.event?.id).toBe(1);
  });
});
