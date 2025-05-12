export function toSafeAlias(str: string) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ñ/g, "n")
        .replace(/[^\w]/g, "_")
        .toLowerCase();
}
