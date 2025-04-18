export interface Booking {
  id?: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}
