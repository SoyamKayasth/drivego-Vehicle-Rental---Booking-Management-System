/**
 * Authoritative Server-side Rental Price Calculator
 * Handles Hourly, Daily, Weekly, and Monthly rental types
 */
export const calculateRentalPrice = (vehicle, rentalType, startDateTime, endDateTime) => {
  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid start or end date format.');
  }

  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) {
    throw new Error('End date and time must be strictly after start date and time.');
  }

  const totalHours = diffMs / (1000 * 60 * 60);
  const totalDays = diffMs / (1000 * 60 * 60 * 24);

  let duration = 0;
  let baseAmount = 0;

  switch (rentalType) {
    case 'hourly': {
      duration = Math.max(1, Math.ceil(totalHours));
      const rate = vehicle.hourlyRate || Math.ceil((vehicle.dailyRate || 1000) / 10);
      baseAmount = duration * rate;
      break;
    }
    case 'daily': {
      duration = Math.max(1, Math.ceil(totalHours / 24));
      const rate = vehicle.dailyRate || 1000;
      baseAmount = duration * rate;
      break;
    }
    case 'weekly': {
      duration = Math.max(1, Math.ceil(totalDays / 7));
      const rate = vehicle.weeklyRate || (vehicle.dailyRate ? vehicle.dailyRate * 6 : 5000);
      baseAmount = duration * rate;
      break;
    }
    case 'monthly': {
      duration = Math.max(1, Math.ceil(totalDays / 30));
      const rate = vehicle.monthlyRate || (vehicle.dailyRate ? vehicle.dailyRate * 22 : 18000);
      baseAmount = duration * rate;
      break;
    }
    default:
      throw new Error(`Unsupported rental type: ${rentalType}`);
  }

  const securityDeposit = Number(vehicle.securityDeposit) || 0;
  const discount = 0; // extensible for coupon codes
  const totalAmount = baseAmount + securityDeposit - discount;

  return {
    rentalType,
    duration,
    baseAmount: Math.round(baseAmount),
    securityDeposit: Math.round(securityDeposit),
    discount,
    totalAmount: Math.round(totalAmount),
  };
};
