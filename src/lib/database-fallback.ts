/** Return a safe fallback when optional public content is unavailable. */
export async function withDatabaseFallback<T>(
  query: PromiseLike<T>,
  fallback: T,
  context: string,
): Promise<T> {
  try {
    return await query;
  } catch (error) {
    console.error(`Database query failed (${context}):`, error);
    return fallback;
  }
}
