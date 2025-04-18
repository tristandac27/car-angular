import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CarService } from '../../services/car.service';
import { Car } from '../../models/car.interface';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  carForm: FormGroup;
  cars: Car[] = [];
  selectedCarId: number | string | null = null;
  selectedFile: File | null = null;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private carService: CarService,
    private snackBar: MatSnackBar
  ) {
    this.carForm = this.formBuilder.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      available: [true]
    });
  }

  ngOnInit(): void {
    this.loadCars();
  }

  loadCars(): void {
    this.isLoading = true;
    this.carService.getAllCars().subscribe({
      next: (cars) => {
        this.cars = cars;
        this.isLoading = false;
      },
      error: () => {
        this.showError('Erreur lors du chargement des voitures');
        this.isLoading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.carForm.valid) {
      this.isLoading = true;
      const carData: Car = {
        ...this.carForm.value,
        // Convertir les valeurs numériques
        year: +this.carForm.value.year,
        price: +this.carForm.value.price
      };

      if (this.selectedCarId) {
        // Mise à jour d'une voiture existante
        this.carService.updateCarWithImage(+this.selectedCarId, carData, this.selectedFile || undefined).subscribe({
          next: () => {
            this.showSuccess('Voiture mise à jour avec succès');
            this.resetForm();
            this.loadCars();
            this.isLoading = false;
          },
          error: () => {
            this.showError('Erreur lors de la mise à jour de la voiture');
            this.isLoading = false;
          }
        });
      } else {
        // Création d'une nouvelle voiture
        this.carService.createCarWithImage(carData, this.selectedFile || undefined).subscribe({
          next: () => {
            this.showSuccess('Voiture ajoutée avec succès');
            this.resetForm();
            this.loadCars();
            this.isLoading = false;
          },
          error: () => {
            this.showError('Erreur lors de l\'ajout de la voiture');
            this.isLoading = false;
          }
        });
      }
    }
  }

  editCar(car: Car): void {
    this.selectedCarId = car.id || null;
    this.carForm.patchValue({
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price,
      description: car.description,
      available: car.available
    });
    this.selectedFile = null;
  }

  deleteCar(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette voiture ?')) {
      this.isLoading = true;
      this.carService.deleteCar(id).subscribe({
        next: () => {
          this.showSuccess('Voiture supprimée avec succès');
          this.loadCars();
          this.isLoading = false;
        },
        error: () => {
          this.showError('Erreur lors de la suppression de la voiture');
          this.isLoading = false;
        }
      });
    }
  }

  resetForm(): void {
    this.carForm.reset({
      available: true
    });
    this.selectedCarId = null;
    this.selectedFile = null;
  }

  getImageUrl(car: Car): string {
    return this.carService.getImageUrl(car.photo || '');
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
