import { calculateDaysBetween } from '@/utils/calendar';
import { cleaningCharges, serviceCharge, taxRate } from './constants';


type BookingDetails = {
  checkIn: Date;
  checkOut: Date;
  price: number;
};

export const calculateTotals = ({
  checkIn,
  checkOut,
  price,
}: BookingDetails) => {
    
  const totalNights = calculateDaysBetween({ checkIn, checkOut });
  const subTotal = totalNights * price;
  const cleaning = cleaningCharges;
  const service = serviceCharge;
  const tax = subTotal * taxRate;
  const orderTotal = subTotal + cleaning + service + tax;

  return { totalNights, subTotal, cleaning, service, tax, orderTotal };
};