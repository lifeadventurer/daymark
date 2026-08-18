export interface DateContext {
  year: number;
  month: number;
  monthName: string;
  dateNumber: number;
  weekdayName: string;
  isoDate: string;
}

export function getDateContext(date: Date): DateContext {
  const localDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  return {
    year: localDate.getFullYear(),
    month: localDate.getMonth(),
    monthName: new Intl.DateTimeFormat(undefined, { month: "long" }).format(
      localDate,
    ),
    dateNumber: localDate.getDate(),
    weekdayName: new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(
      localDate,
    ),
    isoDate: formatDateInputValue(localDate),
  };
}

export function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateFromInputValue(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return undefined;
  }

  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}
