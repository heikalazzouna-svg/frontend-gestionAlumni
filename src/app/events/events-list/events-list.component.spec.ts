import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventsListComponent } from './events-list.component';
import { EventService } from '../event.service';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('EventsListComponent', () => {
  let component: EventsListComponent;
  let fixture: ComponentFixture<EventsListComponent>;
  let mockService: Partial<EventService>;

  beforeEach(async () => {
    mockService = {
      getEvents: () => of([])
    };

    await TestBed.configureTestingModule({
      imports: [EventsListComponent, RouterTestingModule],
      providers: [{ provide: EventService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(EventsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set filtered same as events on init', () => {
    expect(component.filtered).toEqual([]);
  });
});
