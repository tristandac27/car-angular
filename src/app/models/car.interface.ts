export interface Car {
  id?: number | string;
  brand: string;
  model: string;
  year: number;
  price: number;
  description: string;
  photo?: string;
  likes?: number;
  available: boolean;
  reservedFrom?: string;
  reservedTo?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt?: string;
  updatedAt?: string;
  // Propriétés additionnelles utilisées dans le template
  seats?: number;
  fuelType?: string;
  transmission?: string;
  reservations?: {
    customerName: string;
    customerEmail: string;
    startDate: string;
    endDate: string;
    customerPhone?: string;
    reservedFrom?: string;
    reservedTo?: string;
  }[];
}

export interface Reservation {
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice?: number;
}
