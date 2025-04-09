import { ForbiddenException } from '@nestjs/common';

/**
 * Determina qué año debe usarse para filtrar registros.
 * 
 * - Si el año no se proporciona, se usa el año actual.
 * - Si el año proporcionado es distinto al actual y el usuario no tiene permiso, lanza excepción.
 * - Si el usuario tiene permiso y no se pasa año, devuelve `undefined` (sin filtro).
 *
 * @param year - Año recibido desde el cliente (puede ser string)
 * @param canAccessHistory - Booleano que indica si el usuario tiene permiso para ver histórico
 * @returns El año a usar en la consulta, o `undefined` si no se debe filtrar por año
 */
export function getResolvedYear(year?: string, canAccessHistory = false): number | undefined {
  const currentYear = new Date().getFullYear();

  if (year && Number(year) !== currentYear && !canAccessHistory) {
    throw new ForbiddenException("¡No tienes permiso para consultar contratos de años anteriores!");
  }

  if (canAccessHistory && !year) {
    return undefined; // No se filtra por año
  }

  return year ? Number(year) : currentYear;
}
