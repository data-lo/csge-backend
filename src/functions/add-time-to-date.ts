export function addTimeToDate(
    baseDate: string | Date,
    hours: number = 23,
    minutes: number = 55
  ): string {
    const date = new Date(baseDate);
    const addedMs = (hours * 60 + minutes) * 60 * 1000;
    const result = new Date(date.getTime() + addedMs);
    return result.toISOString();
  }
  