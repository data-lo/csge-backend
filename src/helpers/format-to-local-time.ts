import { tzDate } from "@formkit/tempo";

export const formatToLocalTime = (value: Date | null | undefined) => {
  if (!value) return null;
  const timeZone = 'America/Chihuahua';
  const date = tzDate(value, timeZone)
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return new Date(Date.UTC(year, month, day, 0, 0, 0));
}