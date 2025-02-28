export const formatDateToISO = (date: string | Date): string => {
    const utcDate = new Date(date);
    return utcDate.toISOString().split('T')[0]; // Extrae solo la parte de la fecha
};
