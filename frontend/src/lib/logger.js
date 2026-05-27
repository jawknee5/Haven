export function logError(...args) {
  if (process.env.NODE_ENV !== "production") {
    console.error(...args);
  }
}
