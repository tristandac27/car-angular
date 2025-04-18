import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../models/reservation.interface';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:3000/api/cars';

  constructor(private http: HttpClient) { }

  createReservation(carId: number, reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/${carId}/reserve`, reservation);
  }

  getReservationsForCar(carId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/${carId}/reservations`);
  }

  cancelReservation(carId: number, reservationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${carId}/reservations/${reservationId}`);
  }
}
