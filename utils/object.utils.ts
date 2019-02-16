export class ObjectUtilities {
/**
 * Helper function to assign value to provided object key.
 * @param obj Object to be evaluated.
 * @param key Property to be assigned.
 * @param value Assigned value to property.
 */
  public static setOptionalValue(obj: any, key: string, value: any): void {
    if (value) {
      obj[key] = value;
    }
  }
}
