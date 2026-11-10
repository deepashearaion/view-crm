/** Drops undefined/null values: /api/v1 rejects unknown fields and ignores null. */
export function compact<T extends object>(body: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== undefined && value !== null),
  ) as Partial<T>;
}
