export function normalizePath(path: string): string {
    return path
        .split(".")
        .map((segment) => {
            const words = segment.trim().toLowerCase().split(" ");
            return words
                .map((word, index) =>
                    index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join("");
        })
        .join(".");
}
