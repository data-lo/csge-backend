export function formatNameToUpper(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toUpperCase();
}
