export function requireStringParam(
  value: string | string[] | undefined
): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Parametro URL non valido");
  }

  return value;
}