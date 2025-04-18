export interface Reservation {
  id?: number;
  carId: number;
  available: boolean;
  reservedFrom: string;
  reservedTo: string;
  customerName: string;
  customerEmail: string;
}
