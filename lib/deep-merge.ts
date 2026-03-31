/**
 * Deep-merge plain objects. Arrays and non-objects are replaced by the override value.
 * Used so locale message files can omit keys and inherit from the default (English) catalog.
 */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown>,
): T {
  const output: Record<string, unknown> = { ...base };

  for (const propertyKey of Object.keys(override)) {
    const overrideValue = override[propertyKey];
    const baseValue = output[propertyKey];

    if (
      overrideValue !== null &&
      typeof overrideValue === "object" &&
      !Array.isArray(overrideValue) &&
      baseValue !== null &&
      typeof baseValue === "object" &&
      !Array.isArray(baseValue)
    ) {
      output[propertyKey] = deepMerge(
        baseValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>,
      );
    } else {
      output[propertyKey] = overrideValue;
    }
  }

  return output as T;
}
