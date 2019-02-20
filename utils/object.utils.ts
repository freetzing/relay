export class ObjectUtilities {

  public static getOptionalValue(object: any): any {
    if (object) {
      return object[0]._;
    }
    return undefined;
  }

  public static getOptionalAttribute(object: any, attribute: string): any {
    if (object && object.$) {
      return object.$[attribute];
    }
    return undefined;
  }

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
