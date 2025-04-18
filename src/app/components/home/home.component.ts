import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { Car } from '../../models/car.interface';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  cars: Car[] = [];
  filteredCars: Car[] = [];
  loading = true;
  error: string | null = null;
  searchControl = new FormControl('');
  selectedBrand: string = '';
  currentYear = new Date().getFullYear();
  
  constructor(public carService: CarService) { }

  ngOnInit(): void {
    this.loadCars();
    
    // Configure la recherche avec debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.filterCars(value || '');
      });
  }

  loadCars(): void {
    this.loading = true;
    this.error = null;
    
    this.carService.getCars().subscribe({
      next: (cars) => {
        this.cars = cars;
        this.filteredCars = [...cars];
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des voitures', err);
        this.error = 'Impossible de charger les voitures. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    });
  }

  filterCars(searchTerm: string): void {
    if (!this.cars) return;
    
    const term = searchTerm.toLowerCase().trim();
    
    this.filteredCars = this.cars.filter(car => {
      // Filtre par marque si sélectionnée
      const matchesBrand = !this.selectedBrand || car.brand?.toLowerCase() === this.selectedBrand.toLowerCase();
      
      // Filtre par terme de recherche
      const matchesSearch = !term || 
        car.brand?.toLowerCase().includes(term) || 
        car.model?.toLowerCase().includes(term) || 
        car.description?.toLowerCase().includes(term);
      
      return matchesBrand && matchesSearch;
    });
  }

  filterByBrand(brand: string): void {
    this.selectedBrand = brand;
    this.filterCars(this.searchControl.value || '');
  }

  resetFilters(): void {
    this.selectedBrand = '';
    this.searchControl.setValue('');
    this.filteredCars = [...this.cars];
  }

  likeCar(car: Car): void {
    if (car && car.id) {
      this.carService.likeCar(+car.id).subscribe({
        next: () => {
          // Incrémente le compteur de likes localement pour un retour visuel immédiat
          if (car.likes !== undefined) {
            car.likes++;
          } else {
            car.likes = 1;
          }
        },
        error: (err) => {
          console.error('Erreur lors du like', err);
        }
      });
    }
  }
  
  getPhotoUrl(car: Car): string {
    if (!car || !car.photo) {
      return 'assets/images/car-placeholder.jpg';
    }
    return this.carService.getImageUrl(car.photo);
  }
}
