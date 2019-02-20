import xml2js = require("xml2js");
import {
    IPartLayer,
    IPartProperty,
    IPartViewSettings,
} from "../interfaces/part.interface";
import { ObjectUtilities } from "../utils/object.utils";
import { Property } from "./global.model";

/**
 * @extends Property
 * @classdesc An arbitrary {@link Part} property
 * @param {string} name The name of this PartProperty
 * @param {string} value The value of this PartProperty
 * @param {boolean} [showInLabel = false] - Whether this PartProperty is visible in the label view for its {@link Part} in Fritzing.
 * Defaults to **false**.
 */
export class PartProperty extends Property implements IPartProperty {
    public showInLabel: boolean;

    constructor(params: PartProperty) {
        super(params);
        this.showInLabel = params.showInLabel || false;
    }
}

/**
 * @classdesc A *functional* subcomponent of a {@link Part} that can only interface with other {@link Part} subcomponents
 * in the same layer for a specific view.
 * @param {string} id The ID of this PartLayer
 * @param {boolean} [sticky = false] Whether this PartLayer can be "sticky", so that any other PartLayers "above" this PartLayer move with it.
 * The parameter should only be true if this PartLayer corresponds to PCB {@link PartViewSettings}.
 */
export class PartLayer implements IPartLayer {
    public id: string;
    public sticky: boolean;

    constructor(params: PartLayer) {
        this.id = params.id;
        this.sticky = params.sticky || false;
    }
}

/**
 * @classdesc The view settings for a {@link Part} in Fritzing.
 * @param {object} [params = {}] The constructor parameters of these PartViewSettings.
 * @param {string} params.name The name of the view associated with these PartViewSettings.
 * The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**
 * @param {string} params.image The relative path to the SVG image for the view.
 * @param {PartLayer[]} [params.layers = []] The {@link PartLayer}s of the {@link Part} for the corresponding view.
 * @param {boolean} [params.flipHorizontal = false] Whether the {@link Part} can be horizontally flipped in the view.
 * @param {boolean} [params.flipVertical = false] Whether the {@link Part} can be vertically flipped in the view.
 */
export class PartViewSettings implements IPartViewSettings {
    public name: string;
    public image: string;
    public layers: PartLayer[];
    public flipHorizontal: boolean;
    public flipVertical: boolean;

    constructor(params: PartViewSettings) {
        this.name = params.name;
        this.image = params.image;
        this.layers = params.layers || [];
        this.flipHorizontal = params.flipHorizontal || false;
        this.flipVertical = params.flipVertical || false;
    }

    /**
     * Returns the {@link PartLayer} with the given ID
     * @param {string} id The ID of the {@link PartLayer}
     * @return {PartLayer} The {@link PartLayer} with the given ID
     */
    public getLayer(id: string): PartLayer {
        for (const layerItem of this.layers) {
            if (layerItem.id === id) {
                return layerItem;
            }
        }
        return null;
    }

    /**
     * Returns the {@link PartLayer} at the given index
     * @param {number} index The index of the {@link PartLayer}
     * @return {PartLayer} The {@link PartLayer} at the given index
     */
    public getLayerAt(index: number): PartLayer {
        return this.layers[index];
    }

    /**
     * Adds a {@link PartLayer} to these PartViewSettings on the condition that another {@link PartLayer}
     * with the same ID does not already exist.
     * @param {PartLayer} layer The {@link PartLayer} to be added.
     */
    public setLayer(layer: PartLayer): void {
        if (!this.hasLayer(layer.id)) {
            this.layers.push(layer);
        }
    }

    /**
     * Returns whether these PartViewSettings have a {@link PartLayer} with the given ID.
     * @param {string} id The given ID to search for.
     * @return {boolean} Whether these PartViewSettings have a {@link PartLayer} with the given ID.
     */
    public hasLayer(id: string): boolean {
        for (const layerItem of this.layers) {
            if (layerItem.id === id) {
                return true;
            }
        }
        return false;
    }

    /**
     * Removes the {@link PartLayer} with the given ID
     * @param {string} id The ID of the {@link PartLayer}
     * @return {boolean} Whether a {@link PartLayer} with the given ID was removed
     */
    public removeLayer(id: string): boolean {
        for (const layerItem of this.layers) {
            if (layerItem.id === id) {
                this.layers.splice(this.layers.findIndex(x => layerItem.id === id), 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Removes the {@link PartLayer} at the given index
     * @param {number} index The index of the {@link PartLayer}
     * @return {boolean} Whether a {@link PartLayer} with the given index was removed
     */
    public removeLayerAt(index: number): boolean {
        return this.layers.splice(index, 1).length > 0;
    }
}

/**
 * The current-related values for an {@link ERC}
 * @param {*} flow The flow of the Current
 * @param {*} valueMax The maximum value of the Current
 */
export class Current {
  public flow: any;
  public valueMax: any;

  constructor(params: Current) {
    this.flow = params.flow;
    this.valueMax = params.valueMax;
  }
}

/**
 * @classdesc The ERC (Electric Rule Check) for a {@link PartConnector}.
 * @param {string} type The arbitrary type of this ERC.
 * @param {string} voltage The voltage of this ERC.
 * @param {Current} current The current of this ERC.
 * @param {string} ignore The condition, if met, by which this ERC is ignored.
 */
export class ERC {
  public type: string;
  public voltage: string;
  public current: Current;
  public ignore: string;

  constructor(params: ERC) {
    this.type = params.type;
    this.voltage = params.voltage;
    this.current = params.current;
    this.ignore = params.ignore;
  }
}

/**
 * @classdesc The layer settings of a {@link PartConnector} for a view.
 * @param {object} [params = {}] The constructor parameters of these PartConnectorLayerSettings.
 * @param {string} params.name The name of the corresponding layer.
 * @param {string} params.svgId The ID of the SVG element associated with the corresponding layer and view of a {@link PartConnector}.
 * @param {string} params.terminalId The ID of the SVG element describing the custom terminal point associated with the corresponding
 * layer and view of a {@link PartConnector}.
 * @param {string} params.legId The ID of the SVG element representing a bendable "rubber-band" leg associated with the corresponding
 * layer and view of a {@link PartConnector}. The parameter should only be defined if **terminalId** is not
 * @param {boolean} params.disabled Whether a {@link PartConnector} should be disabled in the corresponding layer and view.
 * The parameter has been renamed from **hybrid** in Fritzing FZP files.
 */
export class PartConnectorLayerSettings {
  public name: string;
  public svgId: string;
  public terminalId: string;
  public legId: string;
  public disabled: boolean;

  constructor(params: PartConnectorLayerSettings) {
    this.name = params.name;
    this.svgId = params.svgId;
    this.terminalId = params.terminalId;
    this.legId = params.legId;
    this.disabled = params.disabled || false;
  }
}

/**
 * @classdesc The view settings for a {@link PartConnector} in Fritzing.
 * @param {string} name The name of the view associated with these PartConnectorViewSettings.
 * The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**.
 * @param {PartConnectorLayerSettings[]} [layerSettings = []] The PartConnectorLayerSettings of the {@link PartConnector} for the corresponding view.
 */
export class PartConnectorViewSettings {
  public name: string;
  public layerSettings: PartConnectorLayerSettings[];

  constructor(params: PartConnectorViewSettings) {
    this.name = params.name;
    this.layerSettings = params.layerSettings || [];
  }

  /**
   * Returns the {@link PartConnectorLayerSettings} with the given name
   * @param {string} name The name of the {@link PartConnectorLayerSettings}
   * @return {PartConnectorLayerSettings} The {@link PartConnectorLayerSettings} with the given name
   */
  public getLayerSettings(name: string): PartConnectorLayerSettings {
    for (const layerItem of this.layerSettings) {
      if (layerItem.name === name) {
        return layerItem;
      }
    }
    return null;
  }

  /**
   * Returns the {@link PartConnectorLayerSettings} at the given index.
   * @param {number} index The index of the {@link PartConnectorLayerSettings}.
   * @return {PartConnectorLayerSettings} The {@link PartConnectorLayerSettings} at the given index.
   */
  public getLayerSettingsAt(index: number): PartConnectorLayerSettings {
    return this.layerSettings[index];
  }

  /**
   * Adds a {@link PartConnectorLayerSettings} to these PartConnectorViewSettings on the condition that
   * another {@link PartConnectorLayerSettings} with the same name does not already exist.
   * @param {PartConnectorLayerSettings} layer The {@link PartConnectorLayerSettings} to be added.
   */
  public setLayerSettings(layerSettings): void {
    if (!this.hasLayerSettings(layerSettings.name)) {
      this.layerSettings.push(layerSettings);
    }
  }

  /**
   * Returns whether these PartConnectorViewSettings have a {@link PartConnectorLayerSettings} with the given name.
   * @param {string} name The given name to search for.
   * @return {boolean} Whether these PartConnectorViewSettings have a {@link PartConnectorLayerSettings} with the given name.
   */
  public hasLayerSettings(name: string): boolean {
    for (const layerItem of this.layerSettings) {
      if (layerItem.name === name) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link PartConnectorLayerSettings} with the given name
   * @param {string} name The name of the {@link PartConnectorLayerSettings}
   * @return {boolean} Whether a {@link PartConnectorLayerSettings} with the given name was removed
   */
  public removeLayerSettings(name: string): boolean {
    for (const layerItem of this.layerSettings) {
      if (layerItem.name === name) {
        this.layerSettings.splice(this.layerSettings.findIndex(x => x.name === name), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link PartConnectorLayerSettings} at the given index
   * @param {number} index The index of the {@link PartConnectorLayerSettings}
   * @return {boolean} Whether a {@link PartConnectorLayerSettings} with the given index was removed
   */
  public removeLayerSettingsAt(index: number): boolean {
    return this.layerSettings.splice(index, 1).length > 0;
  }
}

/**
 * @classdesc A connection point within a {@link Part} that enables it to interface with other {@link Part}s, most often via wire
 * @param {object} [params = {}] The constructor parameters of this PartConnector
 * @param {string} params.id The ID of this PartConnector
 * @param {string} params.name The name of this PartConnector
 * @param {string} params.type The arbitrary type of this PartConnector
 * @param {string} params.description The description of this PartConnector
 * @param {string} params.replacedBy The ID of the PartConnector that renders this PartConnector obsolete
 * @param {ERC} params.erc The {@link ERC} (Electric Rule Check) of this PartConnector
 * @param {PartConnectorViewSettings} [params.viewSettings = []] The {@link PartConnectorViewSettings} of this PartConnector
 */
export class PartConnector {
  public id: string;
  public name: string;
  public type: string;
  public description: string;
  public replacedBy: string;
  public erc: ERC;
  public viewSettings: PartConnectorViewSettings[];

  constructor(params: PartConnector) {
    this.id = params.id;
    this.name = params.name;
    this.type = params.type;
    this.description = params.description;
    this.replacedBy = params.replacedBy;
    this.erc = params.erc;
    this.viewSettings = params.viewSettings || [];
  }

  /**
   * Returns the {@link PartConnectorViewSettings} with the given name
   * @param {string} name The name of the {@link PartConnectorViewSettings}
   * @return {PartConnectorViewSettings} The {@link PartConnectorViewSettings} with the given name
   */
  public getViewSettings(name: string): PartConnectorViewSettings {
    for (const settingItem of this.viewSettings) {
      if (settingItem.name === name) {
        return settingItem;
      }
    }
    return null;
  }

  /**
   * Returns the {@link PartConnectorViewSettings} at the given index.
   * @param {number} index The index of the {@link PartConnectorViewSettings}.
   * @return {PartConnectorViewSettings} The {@link PartConnectorViewSettings} at the given index.
   */
  public getViewSettingsAt(index: number): PartConnectorViewSettings {
    return this.viewSettings[index];
  }

  /**
   * Adds a {@link PartConnectorViewSettings} to this PartConnector on the condition that another
   * {@link PartConnectorViewSettings} with the same name does not already exist.
   * @param {PartConnectorViewSettings} viewSettings The {@link PartConnectorViewSettings} to be added.
   */
  public setViewSettings(viewSettings: PartConnectorViewSettings): void {
    if (!this.hasViewSettings(viewSettings.name)) {
      this.viewSettings.push(viewSettings);
    }
  }

  /**
   * Returns whether this PartConnector has a {@link PartConnectorViewSettings} with the given name.
   * @param {string} name The given name to search for.
   * @return {boolean} Whether this PartConnector has a {@link PartConnectorViewSettings} with the given name.
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
   * Removes the {@link PartConnectorViewSettings} with the given name
   * @param {string} name The name of the {@link PartConnectorViewSettings}
   * @return {boolean} Whether a {@link PartConnectorViewSettings} with the given name was removed
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
   * Removes the {@link PartConnectorViewSettings} at the given index
   * @param {number} index The index of the {@link PartConnectorViewSettings}
   * @return {boolean} Whether a {@link PartConnectorViewSettings} with the given index was removed
   */
  public removeViewSettingsAt(index: number): boolean {
    return this.viewSettings.splice(index, 1).length > 0;
  }
}

/**
 * @classdesc An internal connection between {@link PartConnector}s.
 * @param {string} id The ID of this Bus.
 * @param {string[]} [connectorIds = []] The ID's of the {@link PartConnector}s connected by this Bus.
 */
export class Bus {
  public id: string;
  public connectorIds: string[];

  constructor(params: Bus) {
    this.id = params.id;
    this.connectorIds = params.connectorIds || [];
  }

  /**
   * Returns the connector ID at the given index
   * @param {number} index The index of the connector ID
   * @return {string} The connector ID at the given index
   */
  public getConnectorIdAt(index: number): string {
    return this.connectorIds[index];
  }

  /**
   * Adds a connector ID to this Bus on the condition that it does not already exist
   * @param {string} connectorId The connector ID to be added
   */
  public setConnectorId(connectorId: string): void {
    if (!this.hasConnectorId(connectorId)) {
      this.connectorIds.push(connectorId);
    }
  }

  /**
   * Returns whether this Bus has the given connector ID
   * @param {string} connectorId The given connector ID to search for
   * @return {boolean} Whether this Bus has the given connector ID
   */
  public hasConnectorId(connectorId: string): boolean {
    for (const connectorItem of this.connectorIds) {
      if (connectorItem === connectorId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the given connector ID
   * @param {string} connectorId The connector ID to be removed
   * @return {boolean} Whether the given connector ID was removed
   */
  public removeConnectorId(connectorId: string): boolean {
    for (const connectorItem of this.connectorIds) {
      if (connectorItem === connectorId) {
        this.connectorIds.splice(this.connectorIds.findIndex(x => x === connectorId), 1);
        return true;
      }
    }
  }

  /**
   * Removes the connector ID at the given index
   * @param {number} index The index of the connector ID
   * @return {boolean} Whether the connector ID at the given index was removed
   */
  public removeConnectorIdAt(index: number): boolean {
    return this.connectorIds.splice(index, 1).length > 0;
  }
}

/**
 * @classdesc A *spatial* subcomponent of a {@link Part} used to separate its distinct regions by {@link PartConnector}s.
 * @param {string} id The ID of this Subpart.
 * @param {string} label The label of this Subpart.
 * @param {string[]} [connectorIds = []] The ID's of the {@link PartConnector}s incorporated into this Subpart.
 */
export class Subpart {
  public id: string;
  public label: string;
  public connectorIds: string[];

  constructor(params: Subpart) {
    this.id = params.id;
    this.label = params.label;
    this.connectorIds = params.connectorIds || [];
  }

  /**
   * Returns the connector ID at the given index.
   * @param {number} index The index of the connector ID.
   * @return {string} The connector ID at the given index.
   */
  public getConnectorIdAt(index: number): string {
    return this.connectorIds[index];
  }

  /**
   * Adds a connector ID to this Subpart on the condition that it does not already exist.
   * @param {string} connectorId The connector ID to be added.
   */
  public setConnectorId(connectorId: string): void {
    if (!this.hasConnectorId(connectorId)) {
      this.connectorIds.push(connectorId);
    }
  }

  /**
   * Returns whether this Subpart has the given connector ID
   * @param {string} connectorId The given connector ID to search for
   * @return {boolean} Whether this Subpart has the given connector ID
   */
  public hasConnectorId(connectorId: string): boolean {
    for (const connectorItem of this.connectorIds) {
      if (connectorItem === connectorId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the given connector ID.
   * @param {string} connectorId The connector ID to be removed.
   * @return {boolean} Whether the given connector ID was removed.
   */
  public removeConnectorId(connectorId: string): boolean {
    for (const connectorItem of this.connectorIds) {
      if (connectorItem === connectorId) {
        this.connectorIds.splice(this.connectorIds.findIndex(x => x === connectorItem), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the connector ID at the given index
   * @param {number} index The index of the connector ID
   * @return {boolean} Whether the connector ID at the given index was removed
   */
  public removeConnectorIdAt(index: number): boolean {
    return this.connectorIds.splice(index, 1).length > 0;
  }
}

/**
 * @classdesc A Fritzing Part. In Fritzing, a Part is an abstract representation of a circuit component. This can be anything from a wire,
 * to a sensor or microcontroller.
 * The abstraction contains information regarding metadata, wire connections, buses (internal connections), suparts, and SVG image representations.
 * **See the params documentation for parameter-specific definitions**
 * @param {Object} [params = {}] The constructor parameters of this Part.
 * @param {string} params.moduleId The ID of this Part.
 * @param {string} params.fritzingVersion The version of Fritzing associated with the reference FZP file
 * @param {string} params.referenceFile The reference FZP file for this Part.
 * @param {string} params.author The author of this Part.
 * @param {string} params.version The arbitrary version of this Part.
 * @param {string} params.replacedBy The ID of the Part that renders this Part obselete.
 * @param {string} params.title The title of this Part.
 * @param {string} params.url An arbitrary URL associated with this Part.
 * @param {string} params.label The arbitrary label of this Part. The parameter tends to be more categorical than the Part title,
 * but less so than the taxonomy or family.
 * @param {string} params.date The date that this Part was theoretically created.
 * @param {string} params.description The description of this Part.
 * @param {string} params.taxonomy The taxonomy of this Part. In FZP files, this is normally represented by period-delimited alphanumeric strings.
 * **Example:** part.dip.14.pins.
 * @param {string} params.language The language theoretically used to create this Part.
 * @param {string} params.family The arbitrary Part family that this Part belongs to.
 * @param {string} params.variant The name of this Part which makes it unique within its family.
 * The parameter often references this Part's family by name.
 * @param {string} params.defaultUnits The default units that this Part's dimensions are measured in
 * @param {boolean} [params.ignoreTerminalPoints = false] Whether to ignore the custom terminal points
 * of this Part's {@link PartConnector}s in Fritzing.
 * If **true**, the terminal points of this Part's {@link PartConnector}s default to their SVG connector center.
 * @param {string[]} [params.tags = []] The categorical tags of this Part. Tags are often alphanumeric, with the occasional dash (-).
 * @param {PartProperty[]} [params.properties = [[]] The arbitrary properties of this Part.
 * @param {PartViewSettings[]} [params.viewSettings = []] The {@link PartViewSettings} of this Part.
 * @param {PartConnector[]} [params.connectors = []] The {@link PartConnector}s of this Part.
 * @param {Bus[]} [params.buses = []] The {@link Bus}es of this Part.
 * @param {Subpart[]} [params.subparts = []] The {@link Subpart}s of this Part.
 */
export class Part {
  /**
   * @static
   * Returns the given Part as a string of FZP XML
   * @param {Part} part The given Part
   * @return {string} The given Part as a string of FZP XML
   */
  public static toFZP(part: Part): string {
    return part.toFZP();
  }

  /**
   * @static
   * Returns a Promise that resolves with a {@link Part} object converted from the given FZP XML
   * @param {string} fzp A string of FZP XML
   * @return {Promise} A Promise that resolves with a {@link Part} object converted from the given FZP XML
   */
  public static fromFZP(fzp: string): Promise<Part> {
    return new Promise((resolve, reject) => {
      xml2js.parseString(fzp, { explicitCharkey: true }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(new Part().ParseStringData(data));
        }
      });
    });
  }

  public moduleId: string;
  public fritzingVersion: string;
  public referenceFile: string;
  public author: string;
  public version: string;
  public replacedBy: string;
  public title: string;
  public url: string;
  public label: string;
  public date: string;
  public description: string;
  public taxonomy: string;
  public language: string;
  public family: string;
  public variant: string;
  public defaultUnits: string;
  public ignoreTerminalPoints: boolean;
  public tags: string[];
  public properties: PartProperty[];
  public viewSettings: PartViewSettings[];
  public connectors: PartConnector[];
  public buses: Bus[];
  public subparts: Subpart[];

  constructor(params?: Part) {
    this.moduleId = params.moduleId;
    this.fritzingVersion = params.fritzingVersion;
    this.referenceFile = params.referenceFile;
    this.author = params.author;
    this.version = params.version;
    this.replacedBy = params.replacedBy;
    this.title = params.title;
    this.url = params.url;
    this.label = params.label;
    this.date = params.date;
    this.description = params.description;
    this.taxonomy = params.taxonomy;
    this.language = params.language;
    this.family = params.family;
    this.variant = params.variant;
    this.defaultUnits = params.defaultUnits;
    this.ignoreTerminalPoints = params.ignoreTerminalPoints || false;
    this.tags = params.tags || [];
    this.properties = params.properties || [];
    this.viewSettings = params.viewSettings || [];
    this.connectors = params.connectors || [];
    this.buses = params.buses || [];
    this.subparts = params.subparts || [];
  }

  /**
   * Returns the tag at the given index
   * @param {number} index The index of the tag
   * @return {string} The tag at the given index
   */
  public getTagAt(index: number): string {
    return this.tags[index];
  }

  /**
   * Adds a tag to this Part on the condition that it does not already exist
   * @param {string} tag The tag to be added
   */
  public setTag(tag: string): void {
    if (!this.hasTag(tag)) {
      this.tags.push(tag);
    }
  }

  /**
   * Returns whether this Part has the given tag
   * @param {string} tag The given tag to search for
   * @return {boolean} Whether this Part has the given tag
   */
  public hasTag(tag: string): boolean {
    for (const tagItem of this.tags) {
        if (tagItem === tag) {
          return true;
        }
    }
    return false;
  }

  /**
   * Removes the given tag
   * @param {string} tag The tag to be removed
   * @return {boolean} Whether the given tag was removed
   */
  public removeTag(tag: string): boolean {
    for (const tagItem of this.tags) {
      if (tagItem === tag) {
        this.tags.splice(this.tags.findIndex(x => x === tag), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the tag at the given index
   * @param {number} index The index of the tag
   * @return {boolean} Whether the tag at the given index was removed
   */
  public removeTagAt(index: number): boolean {
    return this.tags.splice(index, 1).length > 0;
  }

  /**
   * Returns the {@link PartProperty} with the given name
   * @param {string} name The name of the {@link PartProperty}
   * @return {PartProperty} The {@link PartProperty} with the given name
   */
  public getProperty(name: string): PartProperty {
    for (const propertyItem of this.properties) {
      if (propertyItem.name === name) {
        return propertyItem;
      }
    }
    return null;
  }

  /**
   * Returns the {@link PartProperty} at the given index
   * @param {number} index The index of the {@link PartProperty}
   * @return {PartProperty} The {@link PartProperty} at the given index
   */
  public getPropertyAt(index: number): PartProperty {
    return this.properties[index];
  }

  /**
   * Adds a {@link PartProperty} to this Part on the condition that another {@link PartProperty} with the same name does not already exist
   * @param {PartProperty} property The {@link PartProperty} to be added
   */
  public setProperty(property: PartProperty): void {
    if (!this.hasProperty(property.name)) {
      this.properties.push(property);
    }
  }

  /**
   * Returns whether this Part has a {@link PartProperty} with the given name
   * @param {string} name The given name to search for
   * @return {boolean} Whether this Part has a {@link PartProperty} with the given name
   */
  public hasProperty(name: string): boolean {
    for (const propertyItem of this.properties) {
      if (propertyItem.name === name) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link PartProperty} with the given name
   * @param {string} name The name of the {@link PartProperty}
   * @return {boolean} Whether a {@link PartProperty} with the given name was removed
   */
  public removeProperty(name: string): boolean {
    for (const propertyItem of this.properties) {
      if (propertyItem.name === name) {
        this.properties.splice(this.properties.findIndex(x => x.name === name), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link PartProperty} at the given index
   * @param {number} index The index of the {@link PartProperty}
   * @return {boolean} Whether a {@link PartProperty} with the given index was removed
   */
  public removePropertyAt(index: number): boolean {
    return this.properties.splice(index, 1).length > 0;
  }

  /**
   * Returns the {@link PartViewSettings} with the given name
   * @param {string} name The name of the {@link PartViewSettings}
   * @return {PartViewSettings} The {@link PartViewSettings} with the given name
   */
  public getViewSettings(name: string): PartViewSettings {
    for (const settingItem of this.viewSettings) {
      if (settingItem.name === name) {
        return settingItem;
      }
    }
    return null;
  }

  /**
   * Returns the {@link PartViewSettings} at the given index
   * @param {number} index The index of the {@link PartViewSettings}
   * @return {PartViewSettings} The {@link PartViewSettings} at the given index
   */
  public getViewSettingsAt(index: number): PartViewSettings {
    return this.viewSettings[index];
  }

  /**
   * Adds a {@link PartViewSettings} to this Part on the condition that another {@link PartViewSettings} with the same name does not already exist
   * @param {PartViewSettings} viewSettings The {@link PartViewSettings} to be added
   */
  public setViewSettings(viewSettings: PartViewSettings): void {
    if (!this.hasViewSettings(viewSettings.name)) {
      this.viewSettings.push(viewSettings);
    }
  }

  /**
   * Returns whether this Part has a {@link PartViewSettings} with the given name
   * @param {string} name The given name to search for
   * @return {boolean} Whether this Part has a {@link PartViewSettings} with the given name
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
   * Removes the {@link PartViewSettings} with the given name
   * @param {string} name The name of the {@link PartViewSettings}
   * @return {boolean} Whether a {@link PartViewSettings} with the given name was removed
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
   * Removes the {@link PartViewSettings} at the given index
   * @param {number} index The index of the {@link PartViewSettings}
   * @return {boolean} Whether a {@link PartViewSettings} with the given index was removed
   */
  public removeViewSettingsAt(index: number): boolean {
    return this.viewSettings.splice(index, 1).length > 0;
  }

  /**
   * Returns the {@link PartConnector} with the given ID
   * @param {string} id The ID of the {@link PartConnector}
   * @return {PartConnector} The {@link PartConnector} with the given ID
   */
  public getConnector(id: string): PartConnector {
    for (const connectorItem of this.connectors) {
      if (connectorItem.id === id) {
        return connectorItem;
      }
    }
    return null;
  }

  /**
   * Returns the {@link PartConnector} at the given index
   * @param {number} index The index of the {@link PartConnector}
   * @return {PartConnector} The {@link PartConnector} at the given index
   */
  public getConnectorAt(index: number): PartConnector {
    return this.connectors[index];
  }

  /**
   * Adds a {@link PartConnector} to this Part on the condition that another {@link PartConnector} with the same ID does not already exist
   * @param {PartConnector} connector The {@link PartConnector} to be added
   */
  public setConnector(connector: PartConnector): void {
    if (!this.hasConnector(connector.id)) {
      this.connectors.push(connector);
    }
  }

  /**
   * Returns whether this Part has a {@link PartConnector} with the given ID
   * @param {string} id The given ID to search for
   * @return {boolean} Whether this Part has a {@link PartConnector} with the given ID
   */
  public hasConnector(id: string): boolean {
    for (const connectorItem of this.connectors) {
      if (connectorItem.id === id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link PartConnector} with the given ID
   * @param {string} id The ID of the {@link PartConnector}
   * @return {boolean} Whether a {@link PartConnector} with the given ID was removed
   */
  public removeConnector(id: string): boolean {
    for (const connectorItem of this.connectors) {
      if (connectorItem.id === id) {
        this.connectors.splice(this.connectors.findIndex(x => x.id === id), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link PartConnector} at the given index
   * @param {number} index The index of the {@link PartConnector}
   * @return {boolean} Whether a {@link PartConnector} with the given index was removed
   */
  public removeConnectorAt(index: number): boolean {
    return this.connectors.splice(index, 1).length > 0;
  }

  /**
   * Returns the {@link Bus} with the given ID
   * @param {string} id The ID of the {@link Bus}
   * @return {Bus} The {@link Bus} with the given ID
   */
  public getBus(id: string): Bus {
    for (const busItem of this.buses) {
      if (busItem.id === id) {
        return busItem;
      }
    }
    return null;
  }

  /**
   * Returns the {@link Bus} at the given index
   * @param {number} index The index of the {@link Bus}
   * @return {Bus} The {@link Bus} at the given index
   */
  public getBusAt(index: number): Bus {
    return this.buses[index];
  }

  /**
   * Adds a {@link Bus} to this Part on the condition that another {@link Bus} with the same ID does not already exist
   * @param {Bus} bus The {@link Bus} to be added
   */
  public setBus(bus: Bus): void {
    if (!this.hasBus(bus.id)) {
      this.buses.push(bus);
    }
  }

  /**
   * Returns whether this Part has a {@link Bus} with the given ID
   * @param {string} id The given ID to search for
   * @return {boolean} Whether this Part has a {@link Bus} with the given ID
   */
  public hasBus(id: string): boolean {
    for (const busItem of this.buses) {
      if (busItem.id === id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link Bus} with the given ID
   * @param {string} id The ID of the {@link Bus}
   * @return {boolean} Whether a {@link Bus} with the given ID was removed
   */
  public removeBus(id: string): boolean {
    for (const busItem of this.buses) {
      if (busItem.id === id) {
        this.buses.splice(this.buses.findIndex(x => x.id === id), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link Bus} at the given index
   * @param {number} index The index of the {@link Bus}
   * @return {boolean} Whether a {@link Bus} with the given index was removed
   */
  public removeBusAt(index: number): boolean {
    return this.buses.splice(index, 1).length > 0;
  }

  /**
   * Returns the {@link Subpart} with the given ID
   * @param {string} id The ID of the {@link Subpart}
   * @return {Subpart} The {@link Subpart} with the given ID
   */
  public getSubpart(id: string): Subpart {
    for (const subpartItem of this.subparts) {
      if (subpartItem.id === id) {
        return subpartItem;
      }
    }
    return null;
  }

  /**
   * Returns the {@link Subpart} at the given index
   * @param {number} index The index of the {@link Subpart}
   * @return {Subpart} The {@link Subpart} at the given index
   */
  public getSubpartAt(index: number): Subpart {
    return this.subparts[index];
  }

  /**
   * Adds a {@link Subpart} to this Part on the condition that another {@link Subpart} with the same ID does not already exist
   * @param {Subpart} subpart The {@link Subpart} to be added
   */
  public setSubpart(subpart: Subpart): void {
    if (!this.hasSubpart(subpart.id)) {
      this.subparts.push(subpart);
    }
  }

  /**
   * Returns whether this Part has a {@link Subpart} with the given ID
   * @param {string} id The given ID to search for
   * @return {boolean} Whether this Part has a {@link Subpart} with the given ID
   */
  public hasSubpart(id: string): boolean {
    for (const subpartItem of this.subparts) {
      if (subpartItem.id === id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link Subpart} with the given ID
   * @param {string} id The ID of the {@link Subpart}
   * @return {boolean} Whether a {@link Subpart} with the given ID was removed
   */
  public removeSubpart(id: string): boolean {
    for (const subpartItem of this.subparts) {
      if (subpartItem.id === id) {
        this.subparts.splice(this.subparts.findIndex(x => x.id === id), 1);
        return true;
      }
    }
    return false;
  }

  /**
   * Removes the {@link Subpart} at the given index
   * @param {number} index The index of the {@link Subpart}
   * @return {boolean} Whether a {@link Subpart} with the given index was removed
   */
  public removeSubpartAt(index: number): boolean {
    return this.subparts.splice(index, 1).length > 0;
  }

  /**
   * Returns this Part as a string of FZP XML
   * @return {string} This Part as a string of FZP XML
   */
  public toFZP(): string {

    const moduleObj: {[k: string]: any} = {
      $: { moduleId: this.moduleId },
      title: this.title,
      views: {},
    };

    if (this.version) {
      moduleObj.version = { _: this.version };
      if (this.replacedBy) {
        moduleObj.version.$ = { replacedby: this.replacedBy };
      }
    }

    ObjectUtilities.setOptionalValue(moduleObj.$, "fritzingVersion", this.fritzingVersion);
    ObjectUtilities.setOptionalValue(moduleObj.$, "referenceFile", this.referenceFile);
    ObjectUtilities.setOptionalValue(moduleObj, "author", this.author);
    ObjectUtilities.setOptionalValue(moduleObj, "label", this.label);
    ObjectUtilities.setOptionalValue(moduleObj, "description", this.description);
    ObjectUtilities.setOptionalValue(moduleObj, "url", this.url);
    ObjectUtilities.setOptionalValue(moduleObj, "date", this.date);
    ObjectUtilities.setOptionalValue(moduleObj, "taxonomy", this.taxonomy);
    ObjectUtilities.setOptionalValue(moduleObj, "language", this.language);
    ObjectUtilities.setOptionalValue(moduleObj, "family", this.family);
    ObjectUtilities.setOptionalValue(moduleObj, "variant", this.variant);

    if (this.tags.length > 0) {
      moduleObj.tags = { tag: [] };
      for (const tagItem of this.tags) {
        moduleObj.tags.tag.push({ _: tagItem });
      }
    }

    if (this.properties.length > 0) {
      moduleObj.properties = { property: [] };
      for (const propertyItem of this.properties) {
        const moduleProperty: {[k: string]: any} = {
          $: {
            name: propertyItem.name,
            showInLabel: propertyItem.showInLabel,
          },
        };
        ObjectUtilities.setOptionalValue(moduleProperty, "_", propertyItem.value);
        moduleObj.properties.property.push(moduleProperty);
      }
    }

    for (const viewSettingItem of this.viewSettings) {
      const moduleLayersArray = [];
      for (const layerItem of viewSettingItem.layers) {
        moduleLayersArray.push({
          $: {
            layerId: layerItem.id,
            sticky: layerItem.sticky,
          },
        });
      }
      const moduleLayers: {[k: string]: any} = { layer: moduleLayersArray };
      if (viewSettingItem.image) {
        moduleLayers.$ = { image: viewSettingItem.image };
      }
      moduleObj.views[viewSettingItem.name + "View"] = {
        $: {
          fliphorizontal: viewSettingItem.flipHorizontal,
          flipvertical: viewSettingItem.flipVertical,
        },
        layers: moduleLayers,
      };
    }
    ObjectUtilities.setOptionalValue(moduleObj.views, "defaultUnits", this.defaultUnits);

    if (this.connectors.length > 0) {
      moduleObj.connectors = {
        $: { ignoreTerminalPoints: this.ignoreTerminalPoints },
        connector: [],
      };
      for (const connectorItem of this.connectors) {
        const moduleViews1: {[key: string]: any} = {};
        for (const viewSettingItem of connectorItem.viewSettings) {
          const moduleLayers: Array<{[key: string]: any}> = [];
          for (const layerItem of viewSettingItem.layerSettings) {
            const moduleLayer: {[key: string]: any} = {
              $: { layer: layerItem.name, svgId: layerItem.svgId, hybrid: layerItem.disabled },
            };
            ObjectUtilities.setOptionalValue(moduleLayer, "terminalId", layerItem.terminalId);
            ObjectUtilities.setOptionalValue(moduleLayer, "legId", layerItem.legId);
            moduleLayers.push(moduleLayer);
          }
          moduleViews1[viewSettingItem.name + "View"] = {p: moduleLayers};
        }
        const moduleConnector: {[key: string]: any} = {
          $: { id: connectorItem.id, name: connectorItem.name, type: connectorItem.type },
          views: moduleViews1,
        };
        ObjectUtilities.setOptionalValue(moduleConnector.$, "replacedby", connectorItem.replacedBy);
        ObjectUtilities.setOptionalValue(moduleConnector, "description", connectorItem.description);
        if (connectorItem.erc) {
          moduleConnector.erc = { $: {} };
          ObjectUtilities.setOptionalValue(moduleConnector.erc.$, "etype", connectorItem.erc.type);
          ObjectUtilities.setOptionalValue(moduleConnector.erc.$, "ignore", connectorItem.erc.ignore);
          if (connectorItem.erc.voltage) {
            moduleConnector.erc.voltage = {
              $: { value: connectorItem.erc.voltage },
            };
          }
          if (connectorItem.erc.current) {
            moduleConnector.erc.current = {
              $: { flow: connectorItem.erc.current.flow, valueMax: connectorItem.erc.current.valueMax},
            };
          }
        }
        moduleObj.connectors.connector.push(moduleConnector);
      }
    }

    if (this.buses.length > 0) {
      moduleObj.buses = { bus: [] };
      for (const busItem of this.buses) {
        const moduleConnectors: Array<{[key: string]: any}> = [];
        for (const connectorItem of busItem.connectorIds) {
            moduleConnectors.push({ $: { connectorId: connectorItem }});
        }
        const moduleBus: {[key: string]: any} = { nodeMember: moduleConnectors };
        if (busItem.id) {
          moduleBus.$ = { id: busItem.id };
        }
        moduleObj.buses.bus.push(moduleBus);
      }
    }

    if (this.subparts.length > 0) {
      moduleObj.subparts = { subpart: []};
      for (const subpartItem of this.subparts) {
        const moduleConnectors: Array<{[key: string]: any}> = [];
        for (const connectorItem of subpartItem.connectorIds) {
          moduleConnectors.push({ $: { id: connectorItem }});
        }
        moduleObj.subparts.subpart.push({
          $: {
            id: subpartItem.id,
            label: subpartItem.label,
          },
          connectors: {
            connector: moduleConnectors,
          },
        });
      }
    }

    return new xml2js.Builder().buildObject(({ module: moduleObj }));
  }

  private ParseStringData(data: any): Part {
    return new Part(data);
  }

}

/**
 * @static
 * Returns a Promise that resolves with a {@link Part} object converted from the given FZP XML
 * @param {string} fzp A string of FZP XML
 * @return {Promise} A Promise that resolves with a {@link Part} object converted from the given FZP XML
 */
Part.fromFZP = function (fzp) {
  function getOptionalValue (object) {
    if (object) {
      return object[0]._
    }
    return undefined
  }

  function getOptionalAttribute (object, attribute) {
    if (object && object.$) {
      return object.$[attribute]
    }
    return undefined
  }

  return new Promise(function (resolve, reject) {
    xml2js.parseString(fzp, {
      explicitCharkey: true
    }, function (err, data) {
      var i
      var j
      var layers
      var moduleView
      var moduleViewKey
      var moduleLayer
      var moduleLayers
      var moduleConnectors
      var connectors

      if (err) {
        reject(err)
      } else {
        var moduleObj = data.moduleObj

        var moduleVersion = getOptionalValue(moduleObj.version)
        var moduleReplacedBy
        if (moduleVersion) {
          moduleReplacedBy = getOptionalAttribute(moduleObj.version[0], 'replacedby')
        }

        var tags = []
        if (moduleObj.tags && moduleObj.tags[0].tag) {
          var moduleTags = moduleObj.tags[0].tag
          for (i = 0; i < moduleTags.length; i++) {
            tags.push(moduleTags[i]._)
          }
        }

        var properties = []
        if (moduleObj.properties && moduleObj.properties[0].property) {
          var moduleProperties = moduleObj.properties[0].property
          for (i = 0; i < moduleProperties.length; i++) {
            var moduleProperty = moduleProperties[i]
            properties.push(new PartProperty(
              moduleProperty.$.name,
              moduleProperty._,
              moduleProperty.$.showInLabel
            ))
          }
        }

        var viewSettings = []
        var moduleViewKeys = Object.keys(moduleObj.views[0])
        for (i = 0; i < moduleViewKeys.length; i++) {
          moduleViewKey = moduleViewKeys[i]
          if (moduleViewKey.endsWith('View')) {
            moduleView = moduleObj.views[0][moduleViewKey][0]
            moduleLayers = moduleView.layers[0].layer
            layers = []
            for (j = 0; j < moduleLayers.length; j++) {
              moduleLayer = moduleLayers[j]
              layers.push(new PartLayer(
                moduleLayer.$.layerId,
                getOptionalAttribute(moduleLayer, 'sticky') === 'true'
              ))
            }
            viewSettings.push(new PartViewSettings(
              {
                name: moduleViewKey.slice(0, -4),
                image: getOptionalAttribute(moduleView.layers[0], 'image'),
                layers: layers,
                flipHorizontal: getOptionalAttribute(moduleView, 'fliphorizontal') === 'true',
                flipVertical: getOptionalAttribute(moduleView, 'flipvertical') === 'true'
              }
            ))
          }
        }

        connectors = []
        var ignoreTerminalPoints = false
        if (moduleObj.connectors && moduleObj.connectors[0].connector) {
          moduleConnectors = moduleObj.connectors[0].connector
          ignoreTerminalPoints = getOptionalAttribute(moduleObj.connectors[0], 'ignoreTerminalPoints') === 'true'
          for (i = 0; i < moduleConnectors.length; i++) {
            var viewSettings1 = []
            var moduleConnector = moduleConnectors[i]
            var moduleViewKeys1 = Object.keys(moduleConnector.views[0])
            for (j = 0; j < moduleViewKeys1.length; j++) {
              layers = []
              moduleViewKey = moduleViewKeys1[j]
              moduleView = moduleConnector.views[0][moduleViewKey][0]
              moduleLayers = moduleView.p
              if (moduleLayers) {
                for (var c = 0; c < moduleLayers.length; c++) {
                  moduleLayer = moduleLayers[c]
                  layers.push(new PartConnectorLayerSettings(
                    {
                      name: moduleLayer.$.layer,
                      svgId: moduleLayer.$.svgId,
                      terminalId: moduleLayer.$.terminalId,
                      legId: moduleLayer.$.legId,
                      disabled: moduleLayer.$.hybrid
                    }
                  ))
                }
              }
              viewSettings1.push(new PartConnectorViewSettings(
                moduleViewKey.slice(0, -4),
                layers
              ))
            }
            var erc
            if (moduleConnector.erc && moduleConnector.erc[0]) {
              var moduleERC = moduleConnector.erc[0]
              var voltage
              if (moduleERC.voltage && moduleERC.voltage[0]) {
                voltage = moduleERC.voltage[0].$.value
              }
              var current
              if (moduleERC.current && moduleERC.current[0]) {
                var moduleCurrent = moduleERC.current[0]
                current = new Current(
                  getOptionalAttribute(moduleCurrent, 'flow'),
                  getOptionalAttribute(moduleCurrent, 'valueMax')
                )
              }
              erc = new ERC(
                getOptionalAttribute(moduleERC, 'etype'),
                voltage,
                current,
                getOptionalAttribute(moduleERC, 'ignore')

              )
            }
            connectors.push(new PartConnector(
              {
                id: moduleConnector.$.id,
                name: moduleConnector.$.name,
                type: moduleConnector.$.type,
                description: getOptionalValue(moduleConnector.description),
                replacedBy: moduleConnector.$.replacedby,
                erc: erc,
                viewSettings: viewSettings1
              }
            ))
          }
        }

        var buses = []
        if (moduleObj.buses && moduleObj.buses[0].bus) {
          var moduleBuses = moduleObj.buses[0].bus
          for (i = 0; i < moduleBuses.length; i++) {
            connectors = []
            var moduleBus = moduleBuses[i]
            moduleConnectors = moduleBus.nodeMember
            if (moduleConnectors) {
              for (j = 0; j < moduleConnectors.length; j++) {
                connectors.push(moduleConnectors[j].$.connectorId)
              }
            }
            buses.push(new Bus(
              getOptionalAttribute(moduleBus, 'id'),
              connectors
            ))
          }
        }

        var subparts = []
        if (moduleObj['schematic-subparts'] && moduleObj['schematic-subparts'][0].subpart) {
          var moduleSubparts = moduleObj['schematic-subparts'][0].subpart
          for (i = 0; i < moduleSubparts.length; i++) {
            connectors = []
            var moduleSubpart = moduleSubparts[i]
            moduleConnectors = moduleSubpart.connectors[0].connector
            for (j = 0; j < moduleConnectors.length; j++) {
              connectors.push(moduleConnectors[j].$.id)
            }
            subparts.push(new Subpart(
              moduleSubpart.$.id,
              moduleSubpart.$.label,
              connectors
            ))
          }
        }

        return resolve(new Part({
          moduleId: moduleObj.$.moduleId,
          title: moduleObj.title[0]._,
          fritzingVersion: getOptionalAttribute(moduleObj, 'fritzingVersion'),
          referenceFile: getOptionalAttribute(moduleObj, 'referenceFile'),
          version: moduleVersion,
          replacedBy: moduleReplacedBy,
          author: getOptionalValue(moduleObj.author),
          label: getOptionalValue(moduleObj.label),
          description: getOptionalValue(moduleObj.description),
          url: getOptionalValue(moduleObj.url),
          date: getOptionalValue(moduleObj.date),
          taxonomy: getOptionalValue(moduleObj.taxonomy),
          language: getOptionalValue(moduleObj.language),
          family: getOptionalValue(moduleObj.family),
          variant: getOptionalValue(moduleObj.variant),
          defaultUnits: getOptionalValue(moduleObj.views[0].defaultUnits),
          ignoreTerminalPoints: ignoreTerminalPoints,
          tags: tags,
          properties: properties,
          viewSettings: viewSettings,
          connectors: connectors,
          buses: buses,
          subparts: subparts
        }))
      }
    })
  })
}
