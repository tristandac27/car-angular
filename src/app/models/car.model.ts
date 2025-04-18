export interface Car {
  id?: string | number;
  brand: string;
  model: string;
  year: number;
  price: number;
  description: string;
  photo?: string;
  likes?: number;
  available?: boolean;
  seats?: number;
  fuelType?: string;
  transmission?: string;
  reservedFrom?: string;
  reservedTo?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  reservations?: {
    customerName: string;
    customerEmail: string;
    reservedFrom: string;
    reservedTo: string;
  }[];
}

export interface Reservation {
  startDate: string;
  endDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  totalPrice: number;
}
