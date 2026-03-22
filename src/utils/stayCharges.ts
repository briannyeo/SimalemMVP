export const ROOM_RATE = 180;
export const LUNCH_RATE = 35;
export const DINNER_RATE = 45;

export function parseStayDate(date: string) {
  return new Date(`${date}T00:00:00`);
}

export function getStayLength(
  checkInDate: string | null,
  checkOutDate: string | null,
) {
  if (!checkInDate || !checkOutDate) {
    return 0;
  }

  const differenceInMs =
    parseStayDate(checkOutDate).getTime() - parseStayDate(checkInDate).getTime();

  return Math.max(0, Math.round(differenceInMs / 86400000));
}

export function buildBoardCharges(
  checkInDate: string | null,
  checkOutDate: string | null,
) {
  if (!checkInDate || !checkOutDate) {
    return [] as Array<{ date: string; description: string; amount: number }>;
  }

  const charges: Array<{ date: string; description: string; amount: number }> = [];
  const currentDate = parseStayDate(checkInDate);
  const departureDate = parseStayDate(checkOutDate);

  while (currentDate < departureDate) {
    const chargeDate = currentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    charges.push(
      { date: chargeDate, description: "Room - Deluxe Lake View", amount: ROOM_RATE },
      { date: chargeDate, description: "Farm-sourced Lunch", amount: LUNCH_RATE },
      { date: chargeDate, description: "Farm-sourced Dinner", amount: DINNER_RATE },
    );

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return charges;
}

export function getBoardSubtotal(
  checkInDate: string | null,
  checkOutDate: string | null,
) {
  return buildBoardCharges(checkInDate, checkOutDate).reduce(
    (sum, charge) => sum + charge.amount,
    0,
  );
}
