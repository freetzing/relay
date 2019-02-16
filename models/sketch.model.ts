import xml2js = require("xml2js");
import { ObjectUtilities } from "../utils/object.utils";
import { Point, Property } from "./global.model";

/**
 * @classdesc A Bezier curve used to represent a bend in the leg of a Part {@link Instance}
 * @param {Point} cp0 The first control point of the Bezier curve
 * @param {Point} cp1 The second control point of the Bezier curve
 */
export class Bezier {
  public cp0: Point;
  public cp1: Point;

  constructor(params: Bezier) {
    this.cp0 = params.cp0;
    this.cp1 = params.cp1;
  }
}

/**
 * @classdesc A {@link Bezier} and a {@link Point} object paired together to represent the state of a Part {@link Instance} leg.
 * @param {Point} point The {@link Point} data
 * @param {Bezier} bezier The {@link Bezier} data
 */
export class PointBezierPair {
  public point: Point;
  public bezier: Bezier;

  constructor(params: PointBezierPair) {
    this.point = params.point;
    this.bezier = params.bezier;
  }
}

/**
 * @classdesc A three-dimensional {@link Point} in virtual space
 * @param {number} x The x-coordinate of this Geometry
 * @param {number} y The y-coordinate of this Geometry
 * @param {number} z The z-coordinate of this Geometry, denoting whether an object in virtual space is above or below another.
 * Objects with a higher z value are rendered above
 */
export class Geometry extends Point {
  public z: number;

  constructor(params: Geometry) {
    super(params);
    this.z = params.z;
  }
}

/**
 * @classdesc Describes transformations to an object in two-dimensional, virtual space through a 3x3 matrix
 * https://doc.qt.io/archives/qt-5.7/qtransform.html
 * @param {object} [params = {}] The constructor parameters for this Transform
 * @param {number} params.m11 The horizontal scaling factor
 * @param {number} params.m12 The vertical shearing factor
 * @param {number} params.m13 The horizontal projection factor
 * @param {number} params.m21 The horizontal shearing factor
 * @param {number} params.m22 The vertical scaling factor
 * @param {number} params.m23 The vertical projection factor
 * @param {number} params.m31 The horizontal translation factor
 * @param {number} params.m32 The vertical translation factor
 * @param {number} params.m33 The division factor
 */
export class Transform {
  public m11: number;
  public m12: number;
  public m13: number;
  public m21: number;
  public m22: number;
  public m23: number;
  public m31: number;
  public m32: number;
  public m33: number;

  constructor(params: Transform) {
    this.m11 = params.m11 || 1;
    this.m12 = params.m12 || 0;
    this.m13 = params.m13 || 0;
    this.m21 = params.m21 || 0;
    this.m22 = params.m22 || 1;
    this.m23 = params.m23 || 0;
    this.m31 = params.m31 || 0;
    this.m32 = params.m32 || 0;
    this.m33 = params.m33 || 1;
  }
}

/**
 * @extends Geometry
 * @classdesc An object's position and transformation in three-dimensional space
 * @param {number} x The x-coordinate of the TransformGeometry
 * @param {number} y The y-coordinate of the TransformGeometry
 * @param {number} z The z-coordinate of the TransformGeometry.
 * See {@link Geometry} for the purpose of the z-coordinate in a two-dimensional, virtual space.
 * @param {Transform} transform The {@link Transform} matrix describing the object's transformation from its original state
 */
export class TransformGeometry extends Geometry {
  public transform: Transform;

  constructor(params: TransformGeometry) {
    super(params);
    this.transform = params.transform;
  }
}

/**
 * @extends Geometry
 * @classdesc The {@link Geometry} for a wire in virtual space
 * @param {object} [params = {}] The constructor parameters for this WireGeometry
 * @param {number} params.x The x-coordinate of the WireGeometry
 * @param {number} params.y The y-coordinate of the WireGeometry
 * @param {number} params.z The z-coordinate of the WireGeometry.
 * See {@link Geometry} for the purpose of the z-coordinate in a two-dimensional, virtual space
 * @param {number} [params.x1 = 0] The x-coordinate of one end of the wire, offset from the given x-coordinate of this WireGeometry
 * @param {number} [params.y1 = 0] The y-coordinate of one end of the wire, offset from the given y-coordinate of this WireGeometry
 * @param {number} params.x2 The x-coordinate of the other end of the wire, offset from the given x-coordinate of this WireGeometry
 * @param {number} params.y2 The y-coordinate of the other end of the wire, offset from the given y-coordinate of this WireGeometry
 * @param {number} params.wireFlags Flag values for configuration of the wire, stored as an integer
 *  - NoFlag = 0,
 *  - RoutedFlag = 2,
 *  - PCBTraceFlag = 4,
 *  - ObsoleteJumperFlag = 8,
 *  - RatsnestFlag = 16,
 *  - AutoroutableFlag = 32,
 *  - NormalFlag = 64,
 *  - SchematicTraceFlag = 128
 *
 * https://github.com/fritzing/fritzing-app/blob/master/src/viewgeometry.h
 */
export class WireGeometry extends Geometry {
  public x1: number;
  public x2: number;
  public y1: number;
  public y2: number;
  public wireFlags: number;

  constructor(params: WireGeometry) {
    super(params);
    this.x1 = params.x1 || 0;
    this.y1 = params.y1 || 0;
    this.x2 = params.x2;
    this.y2 = params.y2;
    this.wireFlags = params.wireFlags;
  }
}

/**
 * @extends Geometry
 * @classdesc The {@link Geometry} for a Part {@link Instance}'s title
 * @param {object} [params = {}] The constructor parameters for this TitleGeometry
 * @param {number} params.x The x-coordinate of the TitleGeometry
 * @param {number} params.y The y-coordinate of the TitleGeometry
 * @param {number} params.z The z-coordinate of the TitleGeometry.
 * See {@link Geometry} for the purpose of the z-coordinate in a two-dimensional, virtual space
 * @param {boolean} [params.visible = false] Whether the title is visible
 * @param {number} [params.offsetX = 0] The offset of the title's x-coordinate from the given x-coordinate of this TitleGeometry
 * @param {number} [params.offsetY = 0] The offset of the title's y-coordinate from the given y-coordinate of this TitleGeometry
 * @param {string} params.textColor The color of the title's text as a 6 digit hexidecimal value denoted by the pound (#) sign
 * @param {string} params.fontSize The font size of the title
 * @param {string[]} [params.visibleProperties = []] The keys of the {@link PartProperty}'s' to be forcibly displayed with the title.
 * If this array is left empty, those {@link PartProperty}'s with **showInLabel=true** will be displayed by default
 */
export class TitleGeometry extends Geometry {
  public visible: boolean;
  public offsetX: number;
  public offsetY: number;
  public textColor: string;
  public fontSize: string;
  public visibleProperties: string[];

  constructor(params: TitleGeometry) {
    super(params);
    this.visible = params.visible || true;
    this.offsetX = params.offsetX || 0;
    this.offsetY = params.offsetY || 0;
    this.textColor = params.textColor;
    this.fontSize = params.fontSize;
    this.visibleProperties = params.visibleProperties || [];
  }

  /**
   * Returns the visible property at the given index
   * @param {number} index The index of the visible property
   * @return {string} The visible property at the given index
   */
  public getVisiblePropertyAt(index: number): string {
    return this.visibleProperties[index];
  }

  /**
   * Adds a visible property to this TitleGeometry on the condition that it does not already exist
   * @param {string} visibleProperty The visible property to be added
   */
  public setVisiblePropertyvisibleProperty(visibleProperty: string): void {
    if (!this.hasVisibleProperty(visibleProperty)) {
      this.visibleProperties.push(visibleProperty);
    }
  }

  /**
   * Returns whether this TitleGeometry has the given visible property
   * @param {string} visibleProperty The given visible property to search for
   * @return {boolean} Whether this TitleGeometry has the given visible property
   */
  public hasVisibleProperty(visibleProperty: string): boolean {
    for (const property of this.visibleProperties) {
      if (property === visibleProperty) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the given visible property
   * @param {string} visibleProperty The visible property to be removed
   * @return {boolean} Whether the given visible property was removed
   */
  public removeVisibleProperty(visibleProperty: string): boolean {
    let removed = false;
    for (let i = 0; i < this.visibleProperties.length; i++) {
      if (this.visibleProperties[i] === visibleProperty) {
        this.visibleProperties.splice(i, 1);
        removed = true;
        break;
      }
    }
    return removed;
  }

  /**
   * Removes the visible property at the given index
   * @param {number} index The index of the visible property
   * @return {boolean} Whether the visible property at the given index was removed
   */
  public removeVisiblePropertyAt(index: number): boolean {
    return this.visibleProperties.splice(index, 1).length > 0;
  }
}

/**
 * @classdesc A reference to the connector of another Part {@link Instance}
 * @param {string} id The ID of the {@link InstanceConnector} of the remote {@link Instance}
 * @param {number} modelIndex The unique index of the {@link Instance} containing the referenced {@link InstanceConnector}
 * @param {string} layer The layer of the connection
 */
export class InstanceConnectorReference {
  public id: string;
  public modelIndex: number;
  public layer: string;

  constructor(params: InstanceConnectorReference) {
    this.id = params.id;
    this.modelIndex = params.modelIndex;
    this.layer = params.layer;
  }
}

/**
 * @classdesc A {@link Part} connector of an {@link Instance} that has either established connections or sketch-dependent properties
 * @param {object} [params = {}] The constructor parameters for this InstanceConnector
 * @param {string} params.id The ID of this InstanceConnector
 * @param {string} params.layer The layer of this InstanceConnector
 * @param {Geometry} params.geometry The {@link Geometry} of this InstanceConnector
 * @param {PointBezierPair[]} [params.leg = []] The bendable or straight leg of an InstanceConnector such as an LED,
 * represented by {@link PointBezierPair}s.
 * @param {InstanceConnectorReference[]} [params.connectsTo = []] The {@link InstanceConnectorReference}s that this Instance connects to
 */
export class InstanceConnector {
  public id: string;
  public layer: string;
  public geometry: Geometry;
  public leg: PointBezierPair[];
  public connectsTo: InstanceConnectorReference[];

  constructor(params: InstanceConnector) {
    this.id = params.id;
    this.layer = params.layer;
    this.geometry = params.geometry;
    this.leg = params.leg || [];
    this.connectsTo = params.connectsTo || [];
  }

  /**
   * Returns the leg data point at the given index.
   * @param {number} index The index of the leg data point.
   * @return {PointBezierPair} The leg data point at the given index.
   */
  public getLegDataPointAt(index: number): PointBezierPair {
    return this.leg[index];
  }

  /**
   * Adds a leg data point to this InstanceConnector on the condition that it does not already exist
   * @param {PointBezierPair} legDataPoint The leg data point to be added
   */
  public setLegDataPoint(legDataPoint: PointBezierPair): void {
    if (!this.hasLegDataPoint(legDataPoint)) {
      this.leg.push(legDataPoint);
    }
  }

  /**
   * Returns whether this InstanceConnector has the given leg data point
   * @param {PointBezierPair} legDataPoint The given leg data point to search for
   * @return {boolean} Whether this InstanceConnector has the given leg data point
   */
  public hasLegDataPoint(legDataPoint: PointBezierPair): boolean {
    for (const legData of this.leg) {
      if (legData === legDataPoint) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the given leg data point
   * @param {PointBezierPair} legDataPoint The leg data point to be removed
   * @return {boolean} Whether the given leg data point was removed
   */
  public removeLegDataPoint(legDataPoint: PointBezierPair): boolean {
    for (const legData of this.leg) {
      if (legData === legDataPoint) {
        this.leg.splice(this.leg.findIndex(x => x === legDataPoint), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the leg data point at the given index
   * @param {number} index The index of the leg data point
   * @return {boolean} Whether the leg data point at the given index was removed
   */
  public removeLegDataPointAt(index: number): boolean {
    return this.leg.splice(index, 1).length > 0;
  }

  /**
   * Returns the {@link InstanceConnectorReference} with the given ID
   * @param {string} id The ID of the {@link InstanceConnectorReference}
   * @return {InstanceConnectorReference} The {@link InstanceConnectorReference} with the given ID
   */
  public getConnectorReference(id: string): InstanceConnectorReference {
    for (const connector of this.connectsTo) {
      if (connector.id === id) {
        return connector;
      }
    }
    // TODO: Check data to be returned when not found id on connectsTo Array.
    return null;
  }

  /**
   * Returns the {@link InstanceConnectorReference} at the given index
   * @param {number} index The index of the {@link InstanceConnectorReference}
   * @return {InstanceConnectorReference} The {@link InstanceConnectorReference} at the given index
   */
  public getConnectorReferenceAt(index: number): InstanceConnectorReference {
    return this.connectsTo[index];
  }

  /**
   * Adds a {@link InstanceConnectorReference} to this InstanceConnector on the condition that another {@link InstanceConnectorReference}
   * with the same ID does not already exist.
   * @param {InstanceConnectorReference} connectorReference The {@link InstanceConnectorReference} to be added
   */
  public setConnectorReference(connectorReference: InstanceConnectorReference): void {
    if (!this.hasConnectorReference(connectorReference.id)) {
      this.connectsTo.push(connectorReference);
    }
  }

  /**
   * Returns whether this InstanceConnector has a {@link InstanceConnectorReference} with the given ID
   * @param {string} id The given ID to search for
   * @return {boolean} Whether this InstanceConnector has a {@link InstanceConnectorReference} with the given ID
   */
  public hasConnectorReference(id: string): boolean {
    for (const connector of this.connectsTo) {
      if (connector.id === id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link InstanceConnectorReference} with the given ID
   * @param {string} id The ID of the {@link InstanceConnectorReference}
   * @return {boolean} Whether a {@link InstanceConnectorReference} with the given ID was removed
   */
  public removeConnectorReference(id: string): boolean {
    for (const connector of this.connectsTo) {
      if (connector.id === id) {
        this.connectsTo.splice(this.connectsTo.findIndex(x => x.id === id), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link InstanceConnectorReference} at the given index
   * @param {number} index The index of the {@link InstanceConnectorReference}
   * @return {boolean} Whether a {@link InstanceConnectorReference} at the given index was removed
   */
  public removeConnectorReferenceAt(index: number): boolean {
    return this.connectsTo.splice(index, 1).length > 0;
  }
}

/**
 * @classdesc The view settings for an {@link Instance} in Fritzing
 * @param {object} [params = {}] The constructor parameters for these InstanceViewSettings
 * @param {string} params.name The name of the view associated with these InstanceViewSettings.
 * The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**.
 * @param {string} params.layer The layer that these InstanceViewSettings are on inside the given view
 * @param {Geometry} params.geometry The {@link Geometry} of the corresponding {@link Instance} in the given view and layer
 * @param {TitleGeometry} params.titleGeometry The {@link TitleGeometry} of the corresponding {@link Instance} in the given view and layer
 * @param {InstanceConnector[]} [params.connectors = []] The {@link InstanceConnector}s for the corresponding {@link Instance}
 * in the given view and layer.
 * @param {boolean} [params.locked = false] Seems to prevent the corresponding {@link Instance} from moving in the given view and layer.
 * Confirmation of this variable's purpose would be much appreciated.
 * @param {boolean} [params.bottom = false] Seems to denote whether the corresponding {@link Instance} sticks to the "bottom" in the PCB view.
 * Confirmation of this variable's purpose would be much appreciated.
 * @param {boolean} [params.layerHidden = false] Seem to hide the corresponding {@link Instance} for silkscreen layers in the PCB view.
 * Confirmation of this variable's purpose would be much appreciated.
 */
export class InstanceViewSettings {
  public name: string;
  public layer: string;
  public geometry: Geometry;
  public titleGeometry: TitleGeometry;
  public connectors: InstanceConnector[];
  public bottom: boolean;
  public locked: boolean;
  public layerHidden: boolean;

  constructor(params: InstanceViewSettings) {
    this.name = params.name;
    this.layer = params.layer;
    this.geometry = params.geometry;
    this.titleGeometry = params.titleGeometry;
    this.connectors = params.connectors || [];
    this.bottom = params.bottom || false;
    this.locked = params.locked || false;
    this.layerHidden = params.layerHidden || false;
  }

  /**
   * Returns the {@link InstanceConnector} with the given ID
   * @param {string} id The ID of the {@link InstanceConnector}
   * @return {InstanceConnector} The {@link InstanceConnector} with the given ID
   */
  public getConnector(id: string): InstanceConnector {
    for (const connector of this.connectors) {
      if (connector.id === id) {
        return connector;
      }
    }
    // TODO: Check data to be returned when not found id on connectors Array.
    return null;
  }

  /**
   * Returns the {@link InstanceConnector} at the given index
   * @param {number} index The index of the {@link InstanceConnector}
   * @return {InstanceConnector} The {@link InstanceConnector} at the given index
   */
  public getConnectorAt(index: number): InstanceConnector {
    return this.connectors[index];
  }

  /**
   * Adds a {@link InstanceConnector} to these InstanceViewSettings on the condition that another {@link InstanceConnector}
   * with the same ID does not already exist.
   * @param {InstanceConnector} instanceConnector The {@link InstanceConnector} to be added
   */
  public setConnector(instanceConnector: InstanceConnector): void {
    if (!this.hasConnector(instanceConnector.id)) {
      this.connectors.push(instanceConnector);
    }
  }

  /**
   * Returns whether these InstanceViewSettings have a {@link InstanceConnector} with the given ID
   * @param {string} id The given ID to search for
   * @return {boolean} Whether these InstanceViewSettings have a {@link InstanceConnector} with the given ID
   */
  public hasConnector(id: string): boolean {
    for (const connector of this.connectors) {
      if (connector.id === id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link InstanceConnector} with the given ID
   * @param {string} id The ID of the {@link InstanceConnector}
   * @return {boolean} Whether a {@link InstanceConnector} with the given ID was removed
   */
  public removeConnector(id: string): boolean {
    for (const connector of this.connectors) {
      if (connector.id === id) {
        this.connectors.splice(this.connectors.findIndex(x => x.id === id), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link InstanceConnector} at the given index
   * @param {number} index The index of the {@link InstanceConnector}
   * @return {boolean} Whether a {@link InstanceConnector} at the given index was removed
   */
  public removeConnectorAt(index: number): boolean {
    return this.connectors.splice(index, 1).length > 0;
  }
}

/**
 * @classdesc The additional settings for a wire {@link Instance}
 * @param {object} [params = {}] The constructor parameters for these WireExtras
 * @param {number} params.mils The thickness of the wire in milli-inches
 * @param {string} params.color The color of the wire as a 6 digit hexidecimal value denoted by the pound (#) sign
 * @param {number} params.opacity The opacity of the wire as a decimal value from 0 to 1
 * @param {boolean} [params.banded = false] Whether to display the wire with alternating bands of the given color and white in breadboard view
 * @param {Bezier} params.bezier Appears to be the Bezier curve used to describe the curvature of this wire {@link Instance} in breadboard view.
 * Confirmation of this variable's purpose would be much appreciated
 */
export class WireExtras {
  public mils: number;
  public color: string;
  public opacity: number;
  public banded: boolean;
  public bezier: Bezier;

  constructor(params: WireExtras) {
    this.mils = params.mils;
    this.color = params.color;
    this.opacity = params.opacity;
    this.banded = params.banded || false;
    this.bezier = params.bezier;
  }
}

/**
 * @extends InstanceViewSettings
 * @classdesc The view settings for a wire {@link Instance} in Fritzing
 * @param {object} [params = {}] The constructor parameters for these WireInstanceViewSettings.
 * @param {string} params.name The name of the view associated with these WireInstanceViewSettings.
 * The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**
 * @param {string} params.layer The layer that these WireInstanceViewSettings are on inside the given view.
 * @param {Geometry} params.geometry The {@link Geometry} of the corresponding wire {@link Instance} in the given view and layer.
 * @param {TitleGeometry} params.titleGeometry The {@link TitleGeometry} of the corresponding wire {@link Instance} in the given view and layer.
 * @param {InstanceConnector[]} [params.connectors = []] The {@link InstanceConnector}s for the corresponding wire {@link Instance}
 * in the given view and layer.
 * @param {boolean} [params.locked = false] Seems to prevent the corresponding wire {@link Instance} from moving in the given view and layer.
 * Confirmation of this variable's purpose would be much appreciated.
 * @param {boolean} [params.bottom = false] Seems to denote whether the corresponding wire {@link Instance} sticks to the "bottom" in the PCB view.
 * Confirmation of this variable's purpose would be much appreciated.
 * @param {boolean} [params.layersHidden = false] Seem to hide the corresponding wire {@link Instance} for silkscreen layers in the PCB view.
 * Confirmation of this variable's purpose would be much appreciated
 * @param {WireExtras} params.wireExtras The additional settings for this wire {@link Instance}. See {@link WireExtras} for more
 */
export class WireInstanceViewSettings extends InstanceViewSettings {
  public wireExtras: WireExtras;

  constructor(params: WireInstanceViewSettings) {
    super(params);
    this.wireExtras = params.wireExtras;
  }
}

/**
 * @classdesc Appears to be a local connector within a {@link Instance} that cannot interact with other connectors outside the {@link Instance}.
 * Confirmation of this variable's purpose would be much appreciated.
 * @param {string} id The ID of this LocalConnector.
 * @param {string} name The name of this LocalConnector.
 */
export class LocalConnector {
  public id: string;
  public name: string;

  constructor(params: LocalConnector) {
    this.id = params.id;
    this.name = params.name;
  }
}

/**
 * @classdesc An instance of a {@link Part} within a {@link Sketch}
 * @param {object} [params = {}] The constructor parameters for this Instance
 * @param {string} params.moduleIdRef The module ID of the corresponding {@link Part}
 * @param {string} params.modelIndex The unique index of this Instance within a {@link Sketch}
 * @param {string} params.path The relative path to the corresponding {@link Part}.
 * This variable is only a "hint", and has no real use in the Fritzing app.
 * @param {Property[]} [params.properties = []] The {@link Property}'s of this Instance.
 * @param {string} params.title The title of this Instance.
 * @param {InstanceViewSettings} params.viewSettings The {@link InstanceViewSettings} of this Instance.
 * @param {string} params.text Appears to be some arbitrary text associated with this Instance.
 * Clarifaction of this variable's purpose would be much appreciated.
 * @param {boolean} [params.flippedSMD = false] Appears to decide whether a SMD (Surface Mount Device) Instance is flipped.
 * Confirmation of this variable's purpose would be much appreciated.
 * @param {LocalConnector[]} [params.localConnectors = []] The {@link LocalConnector}s of this Instance
 */
export class Instance {
  public moduleIdRef: string;
  public modelIndex: string;
  public path: string;
  public properties: Property[] | any[];
  public title: string;
  public viewSettings: InstanceViewSettings[] | any[];
  public text: string;
  public flippedSMD: boolean = false;
  public localConnectors: LocalConnector[] | any[];

  constructor(params: Instance) {
    this.moduleIdRef = params.moduleIdRef;
    this.modelIndex = params.modelIndex;
    this.path = params.path;
    this.properties = params.properties;
    this.title = params.title;
    this.viewSettings = params.viewSettings;
    this.text = params.text;
    this.flippedSMD = params.flippedSMD;
    this.localConnectors = params.localConnectors;
  }

  /**
   * Returns the {@link Property} with the given name
   * @param {string} name The name of the {@link Property}
   * @return {Property} The {@link Property} with the given name
   */
  public getProperty(name: string): Property {
    for (const property of this.properties) {
      if (property.name === name) {
        return property;
      }
    }
    return null;
  }

  /**
   * Returns the {@link Property} at the given index
   * @param {number} index The index of the {@link Property}
   * @return {Property} The {@link Property} at the given index
   */
  public getPropertyAt(index: number): Property {
    return this.properties[index];
  }

  /**
   * Adds a {@link Property} to this Instance on the condition that another {@link Property} with the same name does not already exist
   * @param {Property} property The {@link Property} to be added
   */
  public setProperty(property: Property): void {
    if (!this.hasProperty(property.name)) {
      this.properties.push(property);
    }
  }

  /**
   * Returns whether this Instance has a {@link Property} with the given name
   * @param {string} name The given name to search for
   * @return {boolean} Whether this Instance has a {@link Property} with the given name
   */
  public hasProperty(name: string): boolean {
    for (const property of this.properties) {
      if (property.name === name) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link Property} with the given name
   * @param {string} name The name of the {@link Property}
   * @return {boolean} Whether a {@link Property} with the given name was removed
   */
  public removeProperty(name: string): boolean {
    for (const property of this.properties) {
      if (property.name === name) {
        this.properties.splice(this.properties.findIndex(x => x.name === name), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link Property} at the given index
   * @param {number} index The index of the {@link Property}
   * @return {boolean} Whether a {@link Property} at the given index was removed
   */
  public removePropertyAt(index: number): boolean {
    return this.properties.splice(index, 1).length > 0;
  }

  /**
   * Returns the {@link LocalConnector} with the given ID
   * @param {string} id The ID of the {@link LocalConnector}
   * @return {LocalConnector} The {@link LocalConnector} with the given ID
   */
  public getLocalConnector(id: string): LocalConnector {
    for (const connector of this.localConnectors) {
      if (connector.id === id) {
        return connector;
      }
    }
    return null;
  }

  /**
   * Returns the {@link LocalConnector} at the given index
   * @param {number} index The index of the {@link LocalConnector}
   * @return {LocalConnector} The {@link LocalConnector} at the given index
   */
  public getLocalConnectorAt(index: number): LocalConnector {
    return this.localConnectors[index];
  }

  /**
   * Adds a {@link LocalConnector} to this Instance on the condition that another {@link LocalConnector} with the same ID does not already exist
   * @param {LocalConnector} localConnector The {@link LocalConnector} to be added
   */
  public setLocalConnector(localConnector: LocalConnector): void {
    if (!this.hasLocalConnector(localConnector.id)) {
      this.localConnectors.push(localConnector);
    }
  }

  /**
   * Returns whether this Instance has a {@link LocalConnector} with the given ID
   * @param {string} id The given ID to search for
   * @return {boolean} Whether this Instance has a {@link LocalConnector} with the given ID
   */
  public hasLocalConnector(id: string): boolean {
    for (const connector of this.localConnectors) {
      if (connector.id === id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link LocalConnector} with the given ID
   * @param {string} id The ID of the {@link LocalConnector}
   * @return {boolean} Whether a {@link LocalConnector} with the given ID was removed
   */
  public removeLocalConnector(id: string): boolean {
    for (const connector of this.localConnectors) {
      if (connector.id === id) {
        this.localConnectors.splice(this.localConnectors.findIndex(x => x.id === id));
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link LocalConnector} at the given index
   * @param {number} index The index of the {@link LocalConnector}
   * @return {boolean} Whether a {@link LocalConnector} at the given index was removed
   */
  public removeLocalConnectorAt(index: number): boolean {
    return this.localConnectors.splice(index, 1).length > 0;
  }
}

/**
 * @classdesc A program file
 * @param {string} pid The unique ID of a Fritzing application used here to decide whether this Program should be accessed via FZZ or its full path.
 * If the given PID matches the Fritzing application opening this Program, then the full path is used.
 * @param {string} language The programming language that this Program is written in.
 * @param {string} author The author of this Program.
 * @param {string} path The path to this Program in the file system.
 */
export class Program {
  public pid: string;
  public language: string;
  public author: string;
  public path: string;

  constructor(params: Program) {
    this.pid = params.pid;
    this.language = params.language;
    this.author = params.author;
    this.path = params.path;
  }
}

/**
 * @classdesc A PCB (Printed Circuit Board) in a {@link Sketch}
 * @param {object} [params = {}] The constructor parameters for this Board
 * @param {string} params.moduleId The module ID of the {@link Part} associated with this Board
 * @param {string} params.title The title of this Board
 * @param {string} params.instance The title of the {@link Instance} associated with this Board
 * @param {string} params.width The width of this Board in virtual space
 * @param {string} params.height The height of this Board in virtual space
 */
export class Board {
  public moduleId: string;
  public title: string;
  public instance: string;
  public width: string;
  public height: string;

  constructor(params: Board) {
    this.moduleId = params.moduleId;
    this.title = params.title;
    this.instance = params.instance;
    this.width = params.width;
    this.height = params.height;
  }
}

/**
 * @classdesc The view settings for a {@link Sketch} in Fritzing
 * @param {object} [params = {}] The constructor parameters for these SketchViewSettings.
 * @param {string} params.name The name of the view associated with these SketchViewSettings.
 * The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**.
 * @param {string} params.backgroundColor The background color of the associated view as a 6 digit hexidecimal value denoted by the pound (#) sign.
 * @param {string} params.gridSize The width and height of a square in the associated view's grid.
 * @param {boolean} [params.showGrid = true] Whether to show the grid in the associated view.
 * @param {boolean} [params.alignToGrid = false] Whether a {@link Sketch} should be aligned to the grid of the associated view
 * @param {viewFromBelow} [params.viewFromBelow = false] Appears to decide whether a {@link Sketch} can be viewed from below.
 * Confirmation of this variable's purpose would be much appreciated.
 */
export class SketchViewSettings {
  public name: string;
  public backgroundColor: string;
  public gridSize: string;
  public showGrid: boolean;
  public alignToGrid: boolean;
  public viewFromBelow: boolean;

  constructor(params: SketchViewSettings) {
    this.name = params.name;
    this.backgroundColor = params.backgroundColor;
    this.gridSize = params.gridSize;
    this.showGrid = params.showGrid || true;
    this.alignToGrid = params.alignToGrid || false;
    this.viewFromBelow = params.viewFromBelow || false;
  }
}

/**
 * @extends SketchViewSettings
 * @classdesc The PCB view settings for a {@link Sketch} in Fritzing.
 * @param {object} [params = {}] The constructor parameters for these SketchPCBViewSettings.
 * @param {string} params.name The name of the view associated with these SketchPCBViewSettings.
 * The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**
 * @param {string} params.backgroundColor The background color of the associated view as a 6 digit hexidecimal value denoted by the pound (#) sign
 * @param {string} params.gridSize The width and height of a square in the associated view's grid.
 * @param {boolean} [params.showGrid = true] Whether to show the grid in the associated view.
 * @param {boolean} [params.alignToGrid = false] Whether a {@link Sketch} should be aligned to the grid of the associated view.
 * @param {viewFromBelow} [params.viewFromBelow = false] Appears to decide whether a {@link Sketch} can be viewed from below.
 * Confirmation of this variable's purpose would be much appreciated.
 * @param {string} params.arHoleSize Beyond its association with autorouting, this variable's purpose is unknown.
 * @param {string} params.arTraceWidth Beyond its association with autorouting, this variable's purpose is unknown.
 * @param {string} params.arRingWidth Beyond its association with autorouting, this variable's purpose is unknown.
 * @param {string} params.keepoutDRC Beyond its association with autorouting, this variable's purpose is unknown.
 * @param {string} params.keepoutGPG Beyond its association with autorouting, this variable's purpose is unknown.
 */
export class SketchPCBViewSettings extends SketchViewSettings {
  public arHoleSize: string;
  public arTraceWidth: string;
  public arRingWidth: string;
  public keepoutDRC: string;
  public keepoutGPG: string;

  constructor(params: SketchPCBViewSettings) {
    super(params);
    this.arHoleSize = params.arHoleSize;
    this.arTraceWidth = params.arTraceWidth;
    this.arRingWidth = params.arRingWidth;
    this.keepoutDRC = params.keepoutDRC;
    this.keepoutGPG = params.keepoutGPG;
  }
}

/**
 * @classdesc A Fritzing Sketch. In Fritzing, a Sketch is an abstract collection of Parts arranged together in some fashion in different views.
 * A Sketch can also be considered a project because it contains other metadata like {@link Program}s that go with a specific circuit.
 * @param {object} [params = {}] The constructor parameters for this Sketch
 * @param {string} params.fritzingVersion The version of Fritzing used to build this Sketch
 * @param {Program[]} params.programs The {@link Program}s of this Sketch
 * @param {Board[]} params.boards The {@link Board}s of this Sketch
 * @param {SketchViewSettings[]} params.viewSettings The {@link SketchViewSettings} of this Sketch
 * @param {Instance[]} params.instances The {@link Instance}s of this Sketch
 */
export class Sketch {
  /**
   * @static
   * Returns the given Sketch as a string of FZ XML
   * @param {Sketch} sketch The given Sketch
   * @return {string} The given Sketch as a string of FZ XML
   */
  public static toFZ(sketch: Sketch): string {
    return sketch.toFZ();
  }

  public fritzingVersion: string;
  public programs: Program[];
  public boards: Board[];
  public viewSettings: SketchViewSettings[];
  public instances: Instance[];

  constructor(params: Sketch) {
    this.fritzingVersion = params.fritzingVersion;
    this.programs = params.programs || [];
    this.boards = params.boards || [];
    this.viewSettings = params.viewSettings || [];
    this.instances = params.instances || [];
  }

  /**
   * Returns the program at the given index
   * @param {number} index The index of the program
   * @return {Program} The program at the given index
   */
  public getProgramAt(index: number): Program {
    return this.programs[index];
  }

  /**
   * Adds a program to this Sketch on the condition that it does not already exist
   * @param {Program} program The program to be added
   */
  public setProgram(program: Program): void {
    if (!this.hasProgram(program)) {
      this.programs.push(program);
    }
  }

  /**
   * Returns whether this Sketch has the given program
   * @param {Program} program The given program to search for
   * @return {boolean} Whether this Sketch has the given program
   */
  public hasProgram(program: Program): boolean {
    for (const programItem of this.programs) {
      if (programItem === program) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the given program
   * @param {Program} program The program to be removed
   * @return {boolean} Whether the given program was removed
   */
  public removeProgram(program: Program): boolean {
    for (const programItem of this.programs) {
      if (programItem === program) {
        this.programs.splice(this.programs.findIndex(x => x === program), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the program at the given index
   * @param {number} index The index of the program
   * @return {boolean} Whether the program at the given index was removed
   */
  public removeProgramAt(index: number): boolean {
    return this.programs.splice(index, 1).length > 0;
  }

  /**
   * Returns the board at the given index
   * @param {number} index The index of the board
   * @return {Board} The board at the given index
   */
  public getBoardAt(index: number): Board {
    return this.boards[index];
  }

  /**
   * Adds a board to this Sketch on the condition that it does not already exist
   * @param {Board} board The board to be added
   */
  public setBoard(board: Board): void {
    if (!this.hasBoard(board)) {
      this.boards.push(board);
    }
  }

  /**
   * Returns whether this Sketch has the given board
   * @param {Board} board The given board to search for
   * @return {boolean} Whether this Sketch has the given board
   */
  public hasBoard(board: Board): boolean {
    for (const boardItem of this.boards) {
      if (boardItem === board) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the given board
   * @param {Board} board The board to be removed
   * @return {boolean} Whether the given board was removed
   */
  public removeBoard(board: Board): boolean {
    for (const boardItem of this.boards) {
      if (boardItem === board) {
        this.boards.splice(this.boards.findIndex(x => x === boardItem), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the board at the given index
   * @param {number} index The index of the board
   * @return {boolean} Whether the board at the given index was removed
   */
  public removeBoardAt(index: number): boolean {
    return this.boards.splice(index, 1).length > 0;
  }

  /**
   * Returns the {@link SketchViewSettings} with the given name
   * @param {string} name The name of the {@link SketchViewSettings}
   * @return {SketchViewSettings} The {@link SketchViewSettings} with the given name
   */
  public getViewSettings(name: string): SketchViewSettings {
    for (const settingItem of this.viewSettings) {
      if (settingItem.name === name) {
        return settingItem;
      }
    }
    return null;
  }

  /**
   * Returns the {@link SketchViewSettings} at the given index
   * @param {number} index The index of the {@link SketchViewSettings}
   * @return {SketchViewSettings} The {@link SketchViewSettings} at the given index
   */
  public getViewSettingsAt(index: number): SketchViewSettings {
    return this.viewSettings[index];
  }

  /**
   * Adds a {@link SketchViewSettings} to this Sketch on the condition that another {@link SketchViewSettings}
   * with the same name does not already exist.
   * @param {SketchViewSettings} viewSettings The {@link SketchViewSettings} to be added
   */
  public setViewSettings(viewSettings: SketchViewSettings): void {
    if (!this.hasViewSettings(viewSettings.name)) {
      this.viewSettings.push(viewSettings);
    }
  }

  /**
   * Returns whether this Sketch has a {@link SketchViewSettings} with the given name
   * @param {string} name The given name to search for
   * @return {boolean} Whether this Sketch has a {@link SketchViewSettings} with the given name
   */
  public hasViewSettings(name: string): boolean {
    for (const settingItem of this.viewSettings) {
      if (settingItem.name === name) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link SketchViewSettings} with the given name
   * @param {string} name The name of the {@link SketchViewSettings}
   * @return {boolean} Whether a {@link SketchViewSettings} with the given name was removed
   */
  public removeViewSettings(name: string): boolean {
    for (const settingItem of this.viewSettings) {
      if (settingItem.name === name) {
        this.viewSettings.splice(this.viewSettings.findIndex(x => x.name === name), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link SketchViewSettings} at the given index
   * @param {number} index The index of the {@link SketchViewSettings}
   * @return {boolean} Whether a {@link SketchViewSettings} at the given index was removed
   */
  public removeViewSettingsAt(index: number): boolean {
    return this.viewSettings.splice(index, 1).length > 0;
  }

  /**
   * Returns the {@link Instance} with the given model index
   * @param {string} modelIndex The model index of the {@link Instance}
   * @return {Instance} The {@link Instance} with the given model index
   */
  public getInstance(modelIndex: string): Instance {
    for (const instanceItem of this.instances) {
      if (instanceItem.modelIndex === modelIndex) {
        return instanceItem;
      }
    }
  }

  /**
   * Returns the {@link Instance} at the given index
   * @param {number} index The index of the {@link Instance}
   * @return {Instance} The {@link Instance} at the given index
   */
  public getInstanceAt(index: number): Instance {
    return this.instances[index];
  }

  /**
   * Adds a {@link Instance} to this Sketch on the condition that another {@link Instance} with the same model index does not already exist
   * @param {Instance} instance The {@link Instance} to be added
   */
  public setInstance(instance: Instance): void {
    if (!this.hasInstance(instance.modelIndex)) {
      this.instances.push(instance);
    }
  }

  /**
   * Returns whether this Sketch has a {@link Instance} with the given model index
   * @param {string} modelIndex The given model index to search for
   * @return {boolean} Whether this Sketch has a {@link Instance} with the given model index
   */
  public hasInstance(modelIndex: string): boolean {
    for (const instanceItem of this.instances) {
      if (instanceItem.modelIndex === modelIndex) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link Instance} with the given model index
   * @param {string} modelIndex The model index of the {@link Instance}
   * @return {boolean} Whether a {@link Instance} with the given model index was removed
   */
  public removeInstance(modelIndex: string): boolean {
    for (const instanceItem of this.instances) {
      if (instanceItem.modelIndex === modelIndex) {
        this.instances.splice(this.instances.findIndex(x => x.modelIndex === modelIndex), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link Instance} at the given index
   * @param {number} index The index of the {@link Instance}
   * @return {boolean} Whether a {@link Instance} at the given index was removed
   */
  public removeInstanceAt(index: number): boolean {
    return this.instances.splice(index, 1).length > 0;
  }

  /**
   * Returns this Sketch as a string of FZ XML
   * @return {string} This Sketch as a string of FZ XML
   */
  public toFZ(): string {

    const moduleObj: any = {
      $: { fritzingVersion: this.fritzingVersion },
      instances: { instance: [] },
      views: { view: [] },
    };

    if (this.boards.length > 0) {
      moduleObj.boards = { board: [] };
      for (const boardItem of this.boards) {
        moduleObj.boards.board.push({
          $: {
            height: boardItem.height,
            instance: boardItem.instance,
            moduleId: boardItem.moduleId,
            title: boardItem.title,
            width: boardItem.width,
          },
        });
      }
    }

    if (this.programs.length > 0) {
      moduleObj.programs = { $: { pid: this.programs[0].pid }, program: [] };
      for (const programItem of this.programs) {
        moduleObj.programs.program.push({
          $: {
            language: programItem.language,
            programmer: programItem.author,
          },
          _: programItem.path,
        });
      }
    }

    for (const viewSettingItem of this.viewSettings) {
      const moduleView: any = {
        $: {
          alignToGrid: viewSettingItem.alignToGrid ? 1 : 0,
          name: viewSettingItem.name + "View",
          showGrid: viewSettingItem.showGrid ? 1 : 0,
          viewFromBelow: viewSettingItem.viewFromBelow ? 1 : 0,
        },
      };
      ObjectUtilities.setOptionalValue(moduleView.$, "backgroundColor", viewSettingItem.backgroundColor);
      ObjectUtilities.setOptionalValue(moduleView.$, "gridSize", viewSettingItem.gridSize);
      if (viewSettingItem instanceof SketchPCBViewSettings) {
        ObjectUtilities.setOptionalValue(moduleView.$, "autorouteViaHoleSize", viewSettingItem.arHoleSize);
        ObjectUtilities.setOptionalValue(moduleView.$, "autorouteTraceWidth", viewSettingItem.arTraceWidth);
        ObjectUtilities.setOptionalValue(moduleView.$, "autorouteViaRingThickness", viewSettingItem.arRingWidth);
      }
      moduleObj.views.view.push(moduleView);
    }

    for (const instanceItem of this.instances) {
      const moduleInstance: any = {
        $: {
          flippedSMD: instanceItem.flippedSMD,
          modelIndex: instanceItem.modelIndex,
          moduleIdRef: instanceItem.moduleIdRef,
          path: instanceItem.path,
        },
        views: {},
      };
      ObjectUtilities.setOptionalValue(moduleInstance, "title", instanceItem.title);
      ObjectUtilities.setOptionalValue(moduleInstance, "text", instanceItem.text);
      if (instanceItem.properties.length > 0) {
        moduleInstance.properties = { property: [] };
        for (const propertyItem of instanceItem.properties) {
          const moduleProperty = { $: { name: propertyItem.name }};
          ObjectUtilities.setOptionalValue(moduleProperty, "value", propertyItem.value);
          moduleInstance.properties.property.push(moduleProperty);
        }
      }

      for (const viewSettingsItem of instanceItem.viewSettings) {
        const moduleView: any = {
          $: {
            bottom: viewSettingsItem.bottom,
            layer: viewSettingsItem.layer,
            locked: viewSettingsItem.locked,
          },
        };
        if (viewSettingsItem.layerHidden) {
          moduleView.layerHidden = { $: { layer: viewSettingsItem.layerHidden }};
        }
        if (viewSettingsItem.titleGeometry) {
          const titleGeometry = viewSettingsItem.titleGeometry;
          const moduleTitleGeometry: any = {
            $: {
              fontSize: titleGeometry.fontSize,
              textColor: titleGeometry.textColor,
              visible: titleGeometry.visible,
              x: titleGeometry.x,
              xOffset: titleGeometry.offsetX,
              y: titleGeometry.y,
              yOffset: titleGeometry.offsetY,
              z: titleGeometry.z,
            },
          };
          if (titleGeometry.visibleProperties.length > 0) {
            moduleTitleGeometry.displayKey = [];
            for (const visiblePropertyItem of titleGeometry.visibleProperties) {
              moduleTitleGeometry.displayKey.push({ _: visiblePropertyItem});
            }
          }
        }

        if (viewSettingsItem.connectors.length > 0) {
          moduleView.connectors = { connector: [] };
          for (const connectorItem of viewSettingsItem.connectors) {
            const moduleConnector: any = {
              $: {
                connectorId: connectorItem.id,
                layer: connectorItem.layer,
              },
              geometry: {
                $: { x: connectorItem.geometry.x, y: connectorItem.geometry.y },
                connects: { connect: [] },
              },
            };
            if (connectorItem.leg.length > 0) {
              moduleConnector.leg = { point: [], bezier: [] };
              const moduleLeg = moduleConnector.leg;
              const modulePoints = moduleLeg.point;
              const moduleBeziers = moduleLeg.bezier;
              for (const legItemPair of connectorItem.leg) {
                modulePoints.push({ $: { x: legItemPair.point.x, y: legItemPair.point.y }});
                if (legItemPair.bezier) {
                  moduleBeziers.push({
                    cp0: {$: { x: legItemPair.bezier.cp0.x, y: legItemPair.bezier.cp0.y }},
                    cp1: {$: { x: legItemPair.bezier.cp1.x, y: legItemPair.bezier.cp1.y }},
                  });
                } else {
                  moduleBeziers.push("");
                }
              }
            }

            for (const connectToItem of connectorItem.connectsTo) {
              moduleConnector.connects.connect.push({
                $: {
                  connectorId: connectToItem.id,
                  layer: connectToItem.layer,
                  modelIndex: connectToItem.modelIndex,
                },
              });
            }
            moduleView.connectors.connector.push(moduleConnector);
          }
        }

        const geometry = viewSettingsItem.geometry;
        // TODO: Check Instance Classes properties because WireInstanceViewSettings does not have those properties.
        if (viewSettingsItem instanceof WireInstanceViewSettings) {
          moduleView.geometry = {
            $: {
              wireFlags: geometry.wireFlags,
              x: geometry.x,
              x1: geometry.x1,
              x2: geometry.x2,
              y: geometry.y,
              y1: geometry.y1,
              y2: geometry.y2,
              z: geometry.z,
            },
          };
          const wireExtras = viewSettingsItem.wireExtras;
          moduleView.wireExtras = {
            $: {
              banded: (wireExtras.banded) ? 1 : 0,
              color: wireExtras.color,
              mils: wireExtras.mils,
              opacity: wireExtras.opacity,
            },
          };
          if (wireExtras.bezier) {
            moduleView.wireExtras.bezier = {
              cp0: {$: { x: wireExtras.bezier.cp0.x, y: wireExtras.bezier.cp0.y }},
              cp1: {$: { x: wireExtras.bezier.cp1.x, y: wireExtras.bezier.cp1.y }},
            };
          }
        } else {
          moduleView.geometry = {
            $: {
              x: geometry.x,
              y: geometry.y,
              z: geometry.z,
            },
          };
          if (geometry.transform) {
            moduleView.geometry.transform = {
              $: {
                m11: geometry.transform.m11,
                m12: geometry.transform.m12,
                m13: geometry.transform.m13,
                m21: geometry.transform.m21,
                m22: geometry.transform.m22,
                m23: geometry.transform.m23,
                m31: geometry.transform.m31,
                m32: geometry.transform.m32,
                m33: geometry.transform.m33,
              },
            };
          }
        }
        moduleInstance.views[viewSettingsItem.name + "View"] = moduleView;
      }

      if (instanceItem.localConnectors.length > 0) {
        moduleInstance.localConnectors = { localConnector: [] };
        for (const localConnectorItem of instanceItem.localConnectors) {
          moduleInstance.localConnectors.localConnector.push({
            $: {
              id: localConnectorItem.id,
              name: localConnectorItem.name,
            },
          });
        }
      }
      moduleObj.instances.instance.push(moduleInstance);
    }
    return new xml2js.Builder().buildObject(({
      module: moduleObj,
    }));
  }
}

/**
 * @static
 * Returns a Promise that resolves with a {@link Sketch} object converted from the given FZ XML
 * @param {string} fz A string of FZ XML
 * @return {Promise} A Promise that resolves with a {@link Sketch} object converted from the given FZ XML
 */
Sketch.fromFZ = function(fz) {
  function getOptionalValue(object) {
    if (object) {
      return object[0]._;
    }
    return undefined;
  }

  function getOptionalAttribute(object, attribute) {
    if (object && object.$) {
      return object.$[attribute];
    }
    return undefined;
  }

  return new Promise(function(resolve, reject) {
    xml2js.parseString(
      fz,
      {
        explicitCharkey: true
      },
      function(err, data) {
        var i;
        var j;
        var c;
        var d;
        var moduleView;
        var moduleGeometry;
        var moduleBezier;
        var moduleCP0;
        var moduleCP1;

        if (err) {
          reject(err);
        } else {
          var module = data.module;

          var boards = [];
          if (module.boards && module.boards[0].board) {
            var moduleBoards = module.boards[0].board;
            for (i = 0; i < moduleBoards.length; i++) {
              var moduleBoard = moduleBoards[i];
              boards.push(
                new Board({
                  moduleId: moduleBoard.$.moduleId,
                  title: moduleBoard.$.title,
                  instance: moduleBoard.$.instance,
                  width: moduleBoard.$.width,
                  height: moduleBoard.$.height
                })
              );
            }
          }

          var programs = [];
          if (module.programs && module.programs[0].program) {
            var modulePrograms = module.programs[0].program;
            var pid = module.programs[0].$.pid;
            for (i = 0; i < modulePrograms.length; i++) {
              var moduleProgram = modulePrograms[i];
              programs.push(
                new Program(
                  pid,
                  moduleProgram.$.language,
                  moduleProgram.$.programmer,
                  moduleProgram._
                )
              );
            }
          }

          var viewSettings = [];
          var moduleViews = module.views[0].view;
          for (i = 0; i < moduleViews.length; i++) {
            moduleView = moduleViews[i];
            var viewName = moduleView.$.name.slice(0, -4);
            var viewSettingsParams = {
              name: viewName,
              backgroundColor: getOptionalAttribute(
                moduleView,
                "backgroundColor"
              ),
              gridSize: getOptionalAttribute(moduleView, "gridSize"),
              showGrid: getOptionalAttribute(moduleView, "showGrid") === "1",
              alignToGrid:
                getOptionalAttribute(moduleView, "alignToGrid") === "1",
              viewFromBelow:
                getOptionalAttribute(moduleView, "viewFromBelow") === "1"
            };

            if (viewName === "pcb") {
              viewSettingsParams["arHoleSize"] = getOptionalAttribute(
                moduleView,
                "autorouteViaHoleSize"
              );
              viewSettingsParams["arTraceWidth"] = getOptionalAttribute(
                moduleView,
                "autorouteTraceWidth"
              );
              viewSettingsParams["arRingWidth"] = getOptionalAttribute(
                moduleView,
                "autorouteViaRingThickness"
              );
              viewSettingsParams["keepoutDRC"] = getOptionalAttribute(
                moduleView,
                "DRC_Keepout"
              );
              viewSettingsParams["keepoutGPG"] = getOptionalAttribute(
                moduleView,
                "GPG_Keepout"
              );
              viewSettings.push(new SketchPCBViewSettings(viewSettingsParams));
            } else {
              viewSettings.push(new SketchViewSettings(viewSettingsParams));
            }
          }

          var instances = [];
          var moduleInstances = module.instances[0].instance;
          for (i = 0; i < moduleInstances.length; i++) {
            var moduleInstance = moduleInstances[i];

            var properties = [];
            if (
              moduleInstance.properties &&
              moduleInstance.properties[0].property
            ) {
              var moduleProperties = moduleInstance.properties[0].property;
              for (j = 0; j < moduleProperties.length; j++) {
                var moduleProperty = moduleProperties[j];
                properties.push(
                  new Property(moduleProperty.$.name, moduleProperty.$.value)
                );
              }
            }

            var viewSettings1 = [];
            var moduleViewKeys = Object.keys(moduleInstance.views[0]);
            for (j = 0; j < moduleViewKeys.length; j++) {
              var titleGeometry;
              var moduleViewKey = moduleViewKeys[j];
              moduleView = moduleInstance.views[0][moduleViewKey][0];
              if (moduleView.titleGeometry) {
                var visibleProperties = [];
                var moduleTitleGeometry = moduleView.titleGeometry[0];
                if (moduleTitleGeometry.displayKey) {
                  var moduleDisplayKeys = moduleTitleGeometry.displayKey;
                  for (c = 0; c < moduleDisplayKeys.length; c++) {
                    visibleProperties.push(moduleDisplayKeys[c].$.key);
                  }
                }
                titleGeometry = new TitleGeometry({
                  x: moduleTitleGeometry.$.x,
                  y: moduleTitleGeometry.$.y,
                  z: moduleTitleGeometry.$.z,
                  visible: moduleTitleGeometry.$.visible === "true",
                  offsetX: moduleTitleGeometry.$.xOffset,
                  offsetY: moduleTitleGeometry.$.yOffset,
                  textColor: moduleTitleGeometry.$.textColor,
                  fontSize: moduleTitleGeometry.$.fontSize,
                  visibleProperties: visibleProperties
                });
              }

              var layerHidden;
              if (moduleView.layerHidden) {
                layerHidden = moduleView.layerHidden[0].$.layer;
              }

              var connectors = [];
              if (moduleView.connectors && moduleView.connectors[0].connector) {
                var moduleConnectors = moduleView.connectors[0].connector;
                for (c = 0; c < moduleConnectors.length; c++) {
                  var moduleConnector = moduleConnectors[c];

                  var leg = [];
                  if (moduleConnector.leg) {
                    var moduleLeg = moduleConnector.leg[0];
                    for (d = 0; d < moduleLeg.point.length; d++) {
                      var modulePoint = moduleLeg.point[d];
                      if (moduleLeg.bezier[d] !== "") {
                        moduleBezier = moduleLeg.bezier[d];
                        moduleCP0 = moduleBezier.cp0[0];
                        moduleCP1 = moduleBezier.cp1[0];
                        leg.push(
                          new PointBezierPair(
                            new Point(modulePoint.$.x, modulePoint.$.y),
                            new Bezier(
                              new Point(moduleCP0.$.x, moduleCP0.$.y),
                              new Point(moduleCP1.$.x, moduleCP1.$.y)
                            )
                          )
                        );
                      } else {
                        leg.push(
                          new PointBezierPair(
                            new Point(modulePoint.$.x, modulePoint.$.y)
                          )
                        );
                      }
                    }
                  }

                  var connectsTo = [];
                  if (
                    moduleConnector.connects &&
                    moduleConnector.connects[0].connect
                  ) {
                    var moduleConnects = moduleConnector.connects[0].connect;
                    for (d = 0; d < moduleConnects.length; d++) {
                      var moduleConnect = moduleConnects[d];
                      connectsTo.push(
                        new InstanceConnectorReference(
                          moduleConnect.$.connectorId,
                          moduleConnect.$.modelIndex,
                          moduleConnect.$.layer
                        )
                      );
                    }
                  }

                  moduleGeometry = moduleConnector.geometry[0];

                  connectors.push(
                    new InstanceConnector({
                      id: moduleConnector.$.connectorId,
                      layer: moduleConnector.$.layer,
                      geometry: new Geometry(
                        moduleGeometry.$.x,
                        moduleGeometry.$.y
                      ),
                      leg: leg,
                      connectsTo: connectsTo
                    })
                  );
                }
              }

              var geometry;
              moduleGeometry = moduleView.geometry[0];
              var x = moduleGeometry.$.x;
              var y = moduleGeometry.$.y;
              var z = moduleGeometry.$.z;

              if (moduleView.wireExtras) {
                geometry = new WireGeometry({
                  x: x,
                  y: y,
                  z: z,
                  x1: moduleGeometry.$.x1,
                  y1: moduleGeometry.$.y1,
                  x2: moduleGeometry.$.x2,
                  y2: moduleGeometry.$.y2,
                  wireFlags: moduleGeometry.$.wireFlags
                });

                var moduleWireExtras = moduleView.wireExtras[0];
                var bezier;
                if (moduleWireExtras.bezier) {
                  moduleBezier = moduleWireExtras.bezier[0];
                  moduleCP0 = moduleBezier.cp0[0];
                  moduleCP1 = moduleBezier.cp1[0];
                  bezier = new Bezier(
                    new Point(moduleCP0.$.x, moduleCP0.$.y),
                    new Point(moduleCP1.$.x, moduleCP1.$.y)
                  );
                }

                var wireExtras = new WireExtras({
                  mils: moduleWireExtras.$.mils,
                  color: moduleWireExtras.$.color,
                  opacity: moduleWireExtras.$.opacity,
                  banded: moduleWireExtras.$.banded === "1",
                  bezier: bezier
                });

                viewSettings1.push(
                  new WireInstanceViewSettings({
                    name: moduleViewKey.slice(0, -4),
                    layer: moduleView.$.layer,
                    geometry: geometry,
                    titleGeometry: titleGeometry,
                    connectors: connectors,
                    bottom: moduleView.$.bottom === "true",
                    locked:
                      getOptionalAttribute(moduleView, "locked") === "true",
                    layerHidden: layerHidden,
                    wireExtras: wireExtras
                  })
                );
              } else {
                var transform;
                if (moduleGeometry.transform) {
                  var moduleTransform = moduleGeometry.transform[0];
                  transform = new Transform({
                    m11: moduleTransform.$.m11,
                    m12: moduleTransform.$.m12,
                    m13: moduleTransform.$.m13,
                    m21: moduleTransform.$.m21,
                    m22: moduleTransform.$.m22,
                    m23: moduleTransform.$.m23,
                    m31: moduleTransform.$.m31,
                    m32: moduleTransform.$.m32,
                    m33: moduleTransform.$.m33
                  });
                }

                geometry = new TransformGeometry(x, y, z, transform);

                viewSettings1.push(
                  new InstanceViewSettings({
                    name: moduleViewKey.slice(0, -4),
                    layer: moduleView.$.layer,
                    geometry: geometry,
                    titleGeometry: titleGeometry,
                    connectors: connectors,
                    bottom: moduleView.$.bottom === "true",
                    locked:
                      getOptionalAttribute(moduleView, "locked") === "true",
                    layerHidden: layerHidden
                  })
                );
              }
            }

            var localConnectors = [];
            if (
              moduleInstance.localConnectors &&
              moduleInstance.localConnectors[0].localConnector
            ) {
              var moduleLocalConnectors =
                moduleInstance.localConnectors[0].localConnector;
              for (j = 0; j < moduleLocalConnectors.length; j++) {
                var moduleLocalConnector = moduleLocalConnectors[j];
                localConnectors.push(
                  new LocalConnector(
                    moduleLocalConnector.$.id,
                    moduleLocalConnector.$.name
                  )
                );
              }
            }

            instances.push(
              new Instance({
                moduleIdRef: moduleInstance.$.moduleIdRef,
                modelIndex: moduleInstance.$.modelIndex,
                path: moduleInstance.$.path,
                properties: properties,
                title: getOptionalValue(moduleInstance.title),
                viewSettings: viewSettings1,
                text: getOptionalValue(moduleInstance.text),
                flippedSMD:
                  getOptionalAttribute(moduleInstance, "flippedSMD") === "true",
                localConnectors: localConnectors
              })
            );
          }
          return resolve(
            new Sketch({
              fritzingVersion: module.$.fritzingVersion,
              programs: programs,
              boards: boards,
              viewSettings: viewSettings,
              instances: instances
            })
          );
        }
      }
    );
  });
};
