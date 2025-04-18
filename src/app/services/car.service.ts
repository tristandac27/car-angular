import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Car } from '../models/car.interface';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = `${environment.apiUrl}/cars`;
  private uploadsUrl = environment.uploadsUrl;

  constructor(private http: HttpClient) {}

  getAllCars(): Observable<Car[]> {
    return this.http.get<Car[]>(this.apiUrl);
  }

  getCars(): Observable<Car[]> {
    return this.getAllCars();
  }

  getCarById(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.apiUrl}/${id}`);
  }

  createCar(car: Car): Observable<Car> {
    return this.http.post<Car>(this.apiUrl, car);
  }

  updateCar(id: number, car: Car): Observable<Car> {
    return this.http.put<Car>(`${this.apiUrl}/${id}`, car);
  }

  createCarWithImage(car: Car, image?: File): Observable<Car> {
    const formData = new FormData();
    if (car) {
      Object.entries(car).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          formData.append(key, String(value));
        }
      });
      if (image) {
        formData.append('photo', image);
      }
    }
    return this.http.post<Car>(this.apiUrl, formData);
  }

  updateCarWithImage(id: number, car: Car, image?: File): Observable<Car> {
    const formData = new FormData();
    if (car) {
      Object.entries(car).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id' && key !== 'photo') {
          formData.append(key, String(value));
        }
      });
      if (image) {
        formData.append('photo', image);
      }
    }
    return this.http.put<Car>(`${this.apiUrl}/${id}`, formData);
  }

  deleteCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  likeCar(id: number): Observable<Car> {
    return this.http.post<Car>(`${this.apiUrl}/${id}/like`, {});
  }

  searchCars(query: string): Observable<Car[]> {
    return this.http.get<Car[]>(`${this.apiUrl}/search?q=${query}`);
  }

  checkAvailability(carId: number, startDate: string, endDate: string): Observable<boolean> {
    return this.getCarById(carId).pipe(
      map(car => {
        if (!car) return false;
        
        if (!car.reservedFrom || !car.reservedTo) return true;
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const reservedStart = new Date(car.reservedFrom);
        const reservedEnd = new Date(car.reservedTo);
        
        return end < reservedStart || start > reservedEnd;
      }),
      catchError((error: Error) => {
        console.error('Error checking availability:', error);
        return of(false);
      })
    );
  }

  makeReservation(carId: number, reservation: {
    startDate: string;
    endDate: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  }): Observable<Car> {
    return this.getCarById(carId).pipe(
      switchMap(car => {
        if (!car) {
          throw new Error('Car not found');
        }

        // Créer un objet avec les données de réservation
        // Format attendu par le backend selon le contrôleur
        const reservationData = {
          ...car,
          reservedFrom: reservation.startDate,
          reservedTo: reservation.endDate,
          customerName: reservation.customerName,
          customerEmail: reservation.customerEmail,
          customerPhone: reservation.customerPhone,
          available: false,
          reservations: car.reservations ? [
            ...car.reservations,
            {
              startDate: reservation.startDate,
              endDate: reservation.endDate,
              customerName: reservation.customerName,
              customerEmail: reservation.customerEmail,
              customerPhone: reservation.customerPhone
            }
          ] : [
            {
              startDate: reservation.startDate,
              endDate: reservation.endDate,
              customerName: reservation.customerName,
              customerEmail: reservation.customerEmail,
              customerPhone: reservation.customerPhone
            }
          ]
        };
        
        // Définir les en-têtes pour JSON
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        
        console.log('Sending reservation data:', JSON.stringify(reservationData));
        
        // Envoyer les données au backend
        return this.http.put<Car>(`${this.apiUrl}/${carId}`, reservationData, { headers }).pipe(
          tap(response => {
            console.log('Reservation response:', response);
          }),
          catchError(error => {
            console.error('Error in reservation:', error);
            throw error;
          })
        );
      }),
      catchError((error: Error) => {
        console.error('Error making reservation:', error);
        throw error;
      })
    );
  }

  getImageUrl(photoPath: string): string {
    if (!photoPath) return 'assets/default-car.jpg';
    
    // Si le chemin commence par '/', c'est une image du backend
    if (photoPath.startsWith('/')) {
      return `${this.uploadsUrl}${photoPath}`;
    }
    
    // Sinon, c'est une image locale ou une URL complète
    return photoPath;
  }
}
