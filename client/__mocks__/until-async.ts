export async function until<T>(
  operation: () => Promise<T> | T,
): Promise<[unknown | null, T | null]> {
  try {
    const result = await operation();
    return [null, result];
  } catch (error) {
    return [error, null];
  }
}
