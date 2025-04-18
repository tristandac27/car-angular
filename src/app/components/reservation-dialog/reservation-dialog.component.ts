import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Car } from '../../models/car.interface';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-reservation-dialog',
  template: `
    <div class="reservation-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>Réserver {{ data.car.brand }} {{ data.car.model }}</h2>
        <button mat-icon-button (click)="onCancel()" class="close-button">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-dialog-content>
        <div class="car-info">
          <div class="car-image">
            <img [src]="getPhotoUrl(data.car.photo)" [alt]="data.car.brand + ' ' + data.car.model">
          </div>
          <div class="car-details">
            <h3>{{ data.car.brand }} {{ data.car.model }}</h3>
            <p class="car-year">{{ data.car.year }}</p>
            <p class="car-price">{{ data.car.price | currency:'EUR':'symbol':'1.0-0' }} / jour</p>
          </div>
        </div>
        
        <div class="reservation-dates">
          <div class="date-item">
            <mat-icon>event_available</mat-icon>
            <div class="date-info">
              <span class="date-label">Date de début</span>
              <span class="date-value">{{ data.startDate | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
          <div class="date-divider"></div>
          <div class="date-item">
            <mat-icon>event_busy</mat-icon>
            <div class="date-info">
              <span class="date-label">Date de fin</span>
              <span class="date-value">{{ data.endDate | date:'dd/MM/yyyy' }}</span>
            </div>
          </div>
        </div>
        
        <div class="price-summary">
          <div class="price-item">
            <span>Tarif journalier</span>
            <span>{{ data.car.price | currency:'EUR':'symbol':'1.0-0' }}</span>
          </div>
          <div class="price-item">
            <span>Nombre de jours</span>
            <span>{{ calculateDays() }}</span>
          </div>
          <div class="price-total">
            <span>Total</span>
            <span>{{ calculateTotalPrice() | currency:'EUR':'symbol':'1.0-0' }}</span>
          </div>
        </div>
        
        <form [formGroup]="reservationForm" class="reservation-form">
          <h3 class="form-title">Informations personnelles</h3>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nom complet</mat-label>
            <input matInput formControlName="customerName" required>
            <mat-icon matPrefix>person</mat-icon>
            <mat-error *ngIf="reservationForm.get('customerName')?.hasError('required')">
              Le nom est requis
            </mat-error>
            <mat-error *ngIf="reservationForm.get('customerName')?.hasError('minlength')">
              Le nom doit contenir au moins 3 caractères
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Email</mat-label>
            <input matInput formControlName="customerEmail" required type="email">
            <mat-icon matPrefix>email</mat-icon>
            <mat-error *ngIf="reservationForm.get('customerEmail')?.hasError('required')">
              L'email est requis
            </mat-error>
            <mat-error *ngIf="reservationForm.get('customerEmail')?.hasError('email')">
              Veuillez entrer un email valide
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Téléphone</mat-label>
            <input matInput formControlName="customerPhone" required>
            <mat-icon matPrefix>phone</mat-icon>
            <mat-error *ngIf="reservationForm.get('customerPhone')?.hasError('required')">
              Le numéro de téléphone est requis
            </mat-error>
            <mat-error *ngIf="reservationForm.get('customerPhone')?.hasError('pattern')">
              Veuillez entrer un numéro de téléphone valide
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()" class="cancel-button">Annuler</button>
        <button mat-raised-button color="primary" 
                [disabled]="reservationForm.invalid"
                (click)="onSubmit()" class="confirm-button">
          <mat-icon>check_circle</mat-icon>
          Confirmer la réservation
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .reservation-dialog {
      background-color: var(--nike-gray);
      color: white;
      padding: 0;
      max-width: 100%;
    }
    
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--nike-dark);
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
    }
    
    .close-button {
      color: white;
    }
    
    mat-dialog-content {
      padding: 24px;
      max-height: 65vh;
    }
    
    .car-info {
      display: flex;
      margin-bottom: 24px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      overflow: hidden;
    }
    
    .car-image {
      width: 120px;
      height: 90px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    .car-details {
      padding: 12px 16px;
      flex: 1;
      
      h3 {
        margin: 0 0 4px;
        font-size: 1.2rem;
        font-weight: 700;
        color: white;
      }
      
      .car-year {
        margin: 0 0 8px;
        color: var(--text-secondary);
        font-size: 0.9rem;
      }
      
      .car-price {
        margin: 0;
        color: var(--nike-red);
        font-weight: 700;
        font-size: 1.1rem;
      }
    }
    
    .reservation-dates {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 16px;
    }
    
    .date-item {
      display: flex;
      align-items: center;
      
      mat-icon {
        color: var(--nike-red);
        margin-right: 12px;
      }
      
      .date-info {
        display: flex;
        flex-direction: column;
        
        .date-label {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        
        .date-value {
          font-weight: 700;
          color: white;
        }
      }
    }
    
    .date-divider {
      width: 40px;
      height: 1px;
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .price-summary {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    
    .price-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    
    .price-total {
      display: flex;
      justify-content: space-between;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      font-weight: 700;
      font-size: 1.1rem;
      color: white;
    }
    
    .form-title {
      margin: 0 0 16px;
      font-size: 1.2rem;
      font-weight: 700;
      color: white;
    }
    
    .reservation-form {
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      padding: 16px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    
    mat-form-field {
      ::ng-deep {
        .mat-form-field-wrapper {
          margin-bottom: 0;
        }
        
        .mat-form-field-flex {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .mat-form-field-label {
          color: var(--text-secondary);
        }
        
        .mat-form-field-underline {
          background-color: rgba(255, 255, 255, 0.2);
        }
        
        .mat-form-field-ripple {
          background-color: var(--nike-red);
        }
        
        .mat-input-element {
          color: white;
        }
        
        .mat-form-field-prefix {
          color: var(--nike-red);
          margin-right: 8px;
        }
      }
    }
    
    mat-dialog-actions {
      padding: 16px 24px;
      background-color: var(--nike-dark);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .cancel-button {
      color: var(--text-secondary);
    }
    
    .confirm-button {
      background-color: var(--nike-red);
      color: white;
      
      mat-icon {
        margin-right: 8px;
      }
    }
  `]
})
export class ReservationDialogComponent {
  reservationForm: FormGroup;
  private uploadsUrl = environment.uploadsUrl;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ReservationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      startDate: Date;
      endDate: Date;
      car: Car;
    }
  ) {
    // Formatage des dates pour le formulaire
    const startDate = this.formatDateForForm(data.startDate);
    const endDate = this.formatDateForForm(data.endDate);
    
    this.reservationForm = this.fb.group({
      startDate: [startDate, Validators.required],
      endDate: [endDate, Validators.required],
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerPhone: ['', [Validators.required, Validators.pattern('^[+]?[0-9]{10,12}$')]]
    });
  }

  // Formater la date pour le formulaire (ISO string)
  private formatDateForForm(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  calculateDays(): number {
    if (!this.data.startDate || !this.data.endDate) return 0;
    
    const start = new Date(this.data.startDate);
    const end = new Date(this.data.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  calculateTotalPrice(): number {
    if (!this.data.car || !this.data.car.price) return 0;
    
    const days = this.calculateDays();
    return days * this.data.car.price;
  }

  getPhotoUrl(photoPath?: string): string {
    if (!photoPath) return 'assets/images/car-placeholder.jpg';
    
    // Si le chemin commence par '/', c'est une image du backend
    if (photoPath.startsWith('/')) {
      return `${this.uploadsUrl}${photoPath}`;
    }
    
    // Sinon, c'est une image locale ou une URL complète
    return photoPath;
  }

  onSubmit(): void {
    if (this.reservationForm.valid) {
      // Récupérer les valeurs du formulaire
      const formValues = this.reservationForm.value;
      
      // S'assurer que les dates sont au bon format
      const reservationData = {
        startDate: formValues.startDate,
        endDate: formValues.endDate,
        customerName: formValues.customerName,
        customerEmail: formValues.customerEmail,
        customerPhone: formValues.customerPhone
      };
      
      console.log('Sending reservation data:', reservationData);
      
      // Fermer le dialogue avec les données de réservation
      this.dialogRef.close(reservationData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
