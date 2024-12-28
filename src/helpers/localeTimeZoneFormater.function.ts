import { tzDate } from "@formkit/tempo";

export const localeTimeFormatter = (value:Date) => {
    const timeZone = 'America/Chihuahua';
    const date = tzDate(value,timeZone)
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    return new Date(year,month,day);
  }