import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CarService } from '../../services/car.service';
import { Car } from '../../models/car.interface';
import { ReservationDialogComponent } from '../reservation-dialog/reservation-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-car-detail',
  templateUrl: './car-detail.component.html',
  styleUrls: ['./car-detail.component.scss']
})
export class CarDetailComponent implements OnInit {
  car: Car | null = null;
  isLoading = true;
  error: string | null = null;
  currentYear: number = new Date().getFullYear();
  
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    selectable: true,
    selectMirror: true,
    weekends: true,
    events: [],
    select: this.handleDateSelect.bind(this),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek'
    },
    height: 'auto',
    eventBackgroundColor: '#e74c3c',
    eventBorderColor: '#c0392b',
    eventTextColor: '#ffffff',
    themeSystem: 'standard',
    dayMaxEvents: true,
    nowIndicator: true
  };

  constructor(
    private route: ActivatedRoute,
    public carService: CarService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCar();
  }

  loadCar(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isLoading = true;
      this.error = null;
      
      this.carService.getCarById(+id).subscribe({
        next: (car) => {
          this.car = car;
          this.updateCalendarEvents();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading car', err);
          this.error = 'Impossible de charger les informations de la voiture. Veuillez réessayer.';
          this.isLoading = false;
        }
      });
    }
  }

  updateCalendarEvents(): void {
    if (this.car && this.car.reservedFrom && this.car.reservedTo) {
      // Convertir les dates en objets Date
      const startDate = new Date(this.car.reservedFrom);
      const endDate = new Date(this.car.reservedTo);
      
      // Ajouter un jour à la date de fin pour l'affichage correct
      endDate.setDate(endDate.getDate() + 1);
      
      this.calendarOptions.events = [
        {
          title: 'Réservé',
          start: startDate,
          end: endDate,
          color: '#e74c3c',
          allDay: true
        }
      ];
      
      // Forcer la mise à jour du calendrier
      if (this.calendarComponent && this.calendarComponent.getApi()) {
        this.calendarComponent.getApi().refetchEvents();
      }
    }
  }

  handleDateSelect(selectInfo: any): void {
    if (this.car && this.car.available) {
      const startDate = selectInfo.start;
      const endDate = selectInfo.end;
      
      // Ouvre le dialogue de réservation avec les dates sélectionnées
      this.openReservationDialog(startDate, endDate);
      
      // Efface la sélection après l'ouverture du dialogue
      const calendarApi = selectInfo.view.calendar;
      calendarApi.unselect();
    }
  }

  openReservationDialog(startDate?: Date, endDate?: Date): void {
    if (!this.car || !this.car.available) return;
    
    const dialogRef = this.dialog.open(ReservationDialogComponent, {
      width: '500px',
      data: {
        car: this.car,
        startDate: startDate,
        endDate: endDate
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        
        // Créer la réservation
        this.carService.makeReservation(
          this.car?.id ? +this.car.id : 0,
          {
            startDate: result.startDate,
            endDate: result.endDate,
            customerName: result.customerName,
            customerEmail: result.customerEmail,
            customerPhone: result.customerPhone
          }
        ).subscribe({
          next: (updatedCar) => {
            this.car = updatedCar;
            this.updateCalendarEvents();
            this.isLoading = false;
            
            // Afficher un message de succès
            this.snackBar.open('Réservation confirmée ! Un email de confirmation a été envoyé.', 'Fermer', {
              duration: 5000,
              panelClass: 'success-snackbar'
            });
          },
          error: (err) => {
            console.error('Error making reservation', err);
            this.isLoading = false;
            
            // Afficher un message d'erreur
            this.snackBar.open('Erreur lors de la réservation. Veuillez réessayer.', 'Fermer', {
              duration: 5000,
              panelClass: 'error-snackbar'
            });
          }
        });
      }
    });
  }

  getPhotoUrl(photoPath?: string): string {
    if (!photoPath) {
      return 'assets/images/car-placeholder.jpg';
    }
    return this.carService.getImageUrl(photoPath);
  }
}
