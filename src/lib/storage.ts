export function getFromLocalStorage<T>(key: string, fallback: T): T {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
}

export function setToLocalStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
}