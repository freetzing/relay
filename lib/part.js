/**
 * GNU GPLv3.0
 *
 *  This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @author Max Karpawich
 * Based on work by Paul Vollmer
 */

'use strict'

var { Property } = require('./global')
var xml2js = require('xml2js')

/**
 * An arbitrary {@link Part} property
 * @constructor
 * @extends Property
 * @param {string} name The name of this PartProperty
 * @param {string} value The value of this PartProperty
 * @param {boolean} [showInLabel = false] - Whether this PartProperty is visible in the label view for its {@link Part} in Fritzing. Defaults to **false**
 */
var PartProperty = function (name, value, showInLabel) {
  Property.call(this, name, value)
  this.showInLabel = showInLabel || false
}

PartProperty.prototype = Object.create(Property.prototype)
PartProperty.prototype.constructor = PartProperty

/**
 * A *functional* subcomponent of a {@link Part} that can only interface with other {@link Part} subcomponents in the same layer for a specific view
 * @constructor
 * @param {string} id The ID of this PartLayer
 * @param {boolean} [sticky = false] Whether this PartLayer can be "sticky", so that any other PartLayers "above" this PartLayer move with it. The parameter should only be true if this PartLayer corresponds to PCB {@link PartViewSettings}
 */
var PartLayer = function (id, sticky) {
  this.id = id
  this.sticky = sticky || false
}

/**
 * The view settings for a {@link Part} in Fritzing
 * @constructor
 * @param {object} [params = {}] The constructor parameters of these PartViewSettings
 * @param {string} params.name The name of the view associated with these PartViewSettings. The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**
 * @param {string} params.image The relative path to the SVG image for the view
 * @param {PartLayer[]} [params.layers = []] The {@link PartLayer}s of the {@link Part} for the corresponding view
 * @param {boolean} [params.flipHorizontal = false] Whether the {@link Part} can be horizontally flipped in the view
 * @param {boolean} [params.flipVertical = false] Whether the {@link Part} can be vertically flipped in the view
 */
var PartViewSettings = function (params = {}) {
  this.name = params.name
  this.image = params.image
  this.layers = params.layers || []
  this.flipHorizontal = params.flipHorizontal || false
  this.flipVertical = params.flipVertical || false
}

/**
 * Returns the {@link PartLayer} with the given ID
 * @param {string} id The ID of the {@link PartLayer}
 * @return {PartLayer} The {@link PartLayer} with the given ID
 */
PartViewSettings.prototype.getLayer = function (id) {
  var layer
  for (var i = 0; i < this.layers; i++) {
    if (this.layers[i].id === id) {
      layer = this.layers[i]
      break
    }
  }
  return layer
}

/**
 * Returns the {@link PartLayer} at the given index
 * @param {number} index The index of the {@link PartLayer}
 * @return {PartLayer} The {@link PartLayer} at the given index
 */
PartViewSettings.prototype.getLayerAt = function (index) {
  return this.layers[index]
}

/**
 * Adds a {@link PartLayer} to these PartViewSettings on the condition that another {@link PartLayer} with the same ID does not already exist
 * @param {PartLayer} layer The {@link PartLayer} to be added
 */
PartViewSettings.prototype.setLayer = function (layer) {
  if (!this.hasLayer(layer.id)) this.layers.push(layer)
}

/**
 * Returns whether these PartViewSettings have a {@link PartLayer} with the given ID
 * @param {string} id The given ID to search for
 * @return {boolean} Whether these PartViewSettings have a {@link PartLayer} with the given ID
 */
PartViewSettings.prototype.hasLayer = function (id) {
  var hasLayer = false
  for (var i = 0; i < this.layers.length; i++) {
    if (this.layers[i].id === id) {
      hasLayer = true
      break
    }
  }
  return hasLayer
}

/**
 * Removes the {@link PartLayer} with the given ID
 * @param {string} id The ID of the {@link PartLayer}
 * @return {boolean} Whether a {@link PartLayer} with the given ID was removed
 */
PartViewSettings.prototype.removeLayer = function (id) {
  var removed = false
  for (var i = 0; i < this.layers.length; i++) {
    if (this.layers[i].id === id) {
      this.layers.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the {@link PartLayer} at the given index
 * @param {number} index The index of the {@link PartLayer}
 * @return {boolean} Whether a {@link PartLayer} with the given index was removed
 */
PartViewSettings.prototype.removeLayerAt = function (index) {
  return this.layers.splice(index, 1).length > 0
}

/**
 * The current-related values for an {@link ERC}
 * @param {*} flow The flow of the Current
 * @param {*} valueMax The maximum value of the Current
 */
var Current = function (flow, valueMax) {
  this.flow = flow
  this.valueMax = valueMax
}

/**
 * The ERC (Electric Rule Check) for a {@link PartConnector}
 * @constructor
 * @param {string} type The arbitrary type of this ERC
 * @param {string} voltage The voltage of this ERC
 * @param {Current} current The current of this ERC
 * @param {string} ignore The condition, if met, by which this ERC is ignored
 */
var ERC = function (type, voltage, current, ignore) {
  this.type = type
  this.voltage = voltage
  this.current = current
  this.ignore = ignore
}

/**
 * The layer settings of a {@link PartConnector} for a view
 * @constructor
 * @param {object} [params = {}] The constructor parameters of these PartConnectorLayerSettings
 * @param {string} params.name The name of the corresponding layer
 * @param {string} params.svgId The ID of the SVG element associated with the corresponding layer and view of a {@link PartConnector}
 * @param {string} params.terminalId The ID of the SVG element describing the custom terminal point associated with the corresponding layer and view of a {@link PartConnector}
 * @param {string} params.legId The ID of the SVG element representing a bendable "rubber-band" leg associated with the corresponding layer and view of a {@link PartConnector}. The parameter should only be defined if **terminalId** is not
 * @param {string} params.disabled Whether a {@link PartConnector} should be disabled in the corresponding layer and view. The parameter has been renamed from **hybrid** in Fritzing FZP files
 */
var PartConnectorLayerSettings = function (params = {}) {
  this.name = params.name
  this.svgId = params.svgId
  this.terminalId = params.terminalId
  this.legId = params.legId
  this.disabled = params.disabled || false
}

/**
 * The view settings for a {@link PartConnector} in Fritzing
 * @constructor
 * @param {string} name The name of the view associated with these PartConnectorViewSettings. The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**
 * @param {PartConnectorLayerSettings[]} [layerSettings = []] The PartConnectorLayerSettings of the {@link PartConnector} for the corresponding view
 */
var PartConnectorViewSettings = function (name, layerSettings) {
  this.name = name
  this.layerSettings = layerSettings || []
}

/**
 * Returns the {@link PartConnectorLayerSettings} with the given name
 * @param {string} name The name of the {@link PartConnectorLayerSettings}
 * @return {PartConnectorLayerSettings} The {@link PartConnectorLayerSettings} with the given name
 */
PartConnectorViewSettings.prototype.getLayerSettings = function (name) {
  var layerSettings
  for (var i = 0; i < this.layerSettings; i++) {
    if (this.layerSettings[i].name === name) {
      layerSettings = this.layerSettings[i]
      break
    }
  }
  return layerSettings
}

/**
 * Returns the {@link PartConnectorLayerSettings} at the given index
 * @param {number} index The index of the {@link PartConnectorLayerSettings}
 * @return {PartConnectorLayerSettings} The {@link PartConnectorLayerSettings} at the given index
 */
PartConnectorViewSettings.prototype.getLayerSettingsAt = function (index) {
  return this.layerSettings[index]
}

/**
 * Adds a {@link PartConnectorLayerSettings} to these PartConnectorViewSettings on the condition that another {@link PartConnectorLayerSettings} with the same name does not already exist
 * @param {PartConnectorLayerSettings} layer The {@link PartConnectorLayerSettings} to be added
 */
PartConnectorViewSettings.prototype.setLayerSettings = function (layerSettings) {
  if (!this.hasLayerSettings(layerSettings.name)) this.layerSettings.push(layerSettings)
}

/**
 * Returns whether these PartConnectorViewSettings have a {@link PartConnectorLayerSettings} with the given name
 * @param {string} name The given name to search for
 * @return {boolean} Whether these PartConnectorViewSettings have a {@link PartConnectorLayerSettings} with the given name
 */
PartConnectorViewSettings.prototype.hasLayerSettings = function (name) {
  var hasLayerSettings = false
  for (var i = 0; i < this.layerSettings.length; i++) {
    if (this.layerSettings[i].name === name) {
      hasLayerSettings = true
      break
    }
  }
  return hasLayerSettings
}

/**
 * Removes the {@link PartConnectorLayerSettings} with the given name
 * @param {string} name The name of the {@link PartConnectorLayerSettings}
 * @return {boolean} Whether a {@link PartConnectorLayerSettings} with the given name was removed
 */
PartConnectorViewSettings.prototype.removeLayerSettings = function (name) {
  var removed = false
  for (var i = 0; i < this.layerSettings.length; i++) {
    if (this.layerSettings[i].name === name) {
      this.layerSettings.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the {@link PartConnectorLayerSettings} at the given index
 * @param {number} index The index of the {@link PartConnectorLayerSettings}
 * @return {boolean} Whether a {@link PartConnectorLayerSettings} with the given index was removed
 */
PartConnectorViewSettings.prototype.removeLayerSettingsAt = function (index) {
  return this.layerSettings.splice(index, 1).length > 0
}

/**
 * A connection point within a {@link Part} that enables it to interface with other {@link Part}s, most often via wire
 * @constructor
 * @param {object} [params = {}] The constructor parameters of this PartConnector
 * @param {string} params.id The ID of this PartConnector
 * @param {string} params.name The name of this PartConnector
 * @param {string} params.type The arbitrary type of this PartConnector
 * @param {string} params.description The description of this PartConnector
 * @param {string} params.replacedBy The ID of the PartConnector that renders this PartConnector obsolete
 * @param {ERC} params.erc The {@link ERC} (Electric Rule Check) of this PartConnector
 * @param {PartConnectorViewSettings} [params.viewSettings = []] The {@link PartConnectorViewSettings} of this PartConnector
 */
var PartConnector = function (params = {}) {
  this.id = params.id
  this.name = params.name
  this.type = params.type
  this.description = params.description
  this.replacedBy = params.replacedBy
  this.erc = params.erc
  this.viewSettings = params.viewSettings || []
}

/**
 * Returns the {@link PartConnectorViewSettings} with the given name
 * @param {string} name The name of the {@link PartConnectorViewSettings}
 * @return {PartConnectorViewSettings} The {@link PartConnectorViewSettings} with the given name
 */
PartConnector.prototype.getViewSettings = function (name) {
  var ret
  for (var i = 0; i < this.viewSettings; i++) {
    if (this.viewSettings[i].name === name) {
      ret = this.viewSettings[i]
      break
    }
  }
  return ret
}

/**
 * Returns the {@link PartConnectorViewSettings} at the given index
 * @param {number} index The index of the {@link PartConnectorViewSettings}
 * @return {PartConnectorViewSettings} The {@link PartConnectorViewSettings} at the given index
 */
PartConnector.prototype.getViewSettingsAt = function (index) {
  return this.viewSettings[index]
}

/**
 * Adds a {@link PartConnectorViewSettings} to this PartConnector on the condition that another {@link PartConnectorViewSettings} with the same name does not already exist
 * @param {PartConnectorViewSettings} viewSettings The {@link PartConnectorViewSettings} to be added
 */
PartConnector.prototype.setViewSettings = function (viewSettings) {
  if (!this.hasViewSettings(viewSettings.name)) this.viewSettings.push(viewSettings)
}

/**
 * Returns whether this PartConnector has a {@link PartConnectorViewSettings} with the given name
 * @param {string} name The given name to search for
 * @return {boolean} Whether this PartConnector has a {@link PartConnectorViewSettings} with the given name
 */
PartConnector.prototype.hasViewSettings = function (name) {
  var has = false
  for (var i = 0; i < this.viewSettings.length; i++) {
    if (this.viewSettings[i].name === name) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the {@link PartConnectorViewSettings} with the given name
 * @param {string} name The name of the {@link PartConnectorViewSettings}
 * @return {boolean} Whether a {@link PartConnectorViewSettings} with the given name was removed
 */
PartConnector.prototype.removeViewSettings = function (name) {
  var removed = false
  for (var i = 0; i < this.viewSettings.length; i++) {
    if (this.viewSettings[i].name === name) {
      this.viewSettings.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the {@link PartConnectorViewSettings} at the given index
 * @param {number} index The index of the {@link PartConnectorViewSettings}
 * @return {boolean} Whether a {@link PartConnectorViewSettings} with the given index was removed
 */
PartConnector.prototype.removeViewSettingsAt = function (index) {
  return this.viewSettings.splice(index, 1).length > 0
}

/**
 * An internal connection between {@link PartConnector}s
 * @constructor
 * @param {string} id The ID of this Bus
 * @param {string[]} [connectorIds = []] The ID's of the {@link PartConnector}s connected by this Bus
 */
var Bus = function (id, connectorIds) {
  this.id = id
  this.connectorIds = connectorIds || []
}

/**
 * Returns the connector ID at the given index
 * @param {number} index The index of the connector ID
 * @return {string} The connector ID at the given index
 */
Bus.prototype.getConnectorIdAt = function (index) {
  return this.connectorIds[index]
}

/**
 * Adds a connector ID to this Bus on the condition that it does not already exist
 * @param {string} connectorId The connector ID to be added
 */
Bus.prototype.setConnectorId = function (connectorId) {
  if (!this.hasConnectorId(connectorId)) this.connectorIds.push(connectorId)
}

/**
 * Returns whether this Bus has the given connector ID
 * @param {string} connectorId The given connector ID to search for
 * @return {boolean} Whether this Bus has the given connector ID
 */
Bus.prototype.hasConnectorId = function (connectorId) {
  var has = false
  for (var i = 0; i < this.connectorIds.length; i++) {
    if (this.connectorIds[i] === connectorId) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the given connector ID
 * @param {string} connectorId The connector ID to be removed
 * @return {boolean} Whether the given connector ID was removed
 */
Bus.prototype.removeConnectorId = function (connectorId) {
  var removed = false
  for (var i = 0; i < this.connectorIds.length; i++) {
    if (this.connectorIds[i] === connectorId) {
      this.connectorIds.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the connector ID at the given index
 * @param {number} index The index of the connector ID
 * @return {boolean} Whether the connector ID at the given index was removed
 */
Bus.prototype.removeConnectorIdAt = function (index) {
  return this.connectorIds.splice(index, 1).length > 0
}

/**
 * A *spatial* subcomponent of a {@link Part} used to separate its distinct regions by {@link PartConnector}s
 * @constructor
 * @param {string} id The ID of this Subpart
 * @param {string} label The label of this Subpart
 * @param {string[]} [connectorIds = []] The ID's of the {@link PartConnector}s incorporated into this Subpart
 */
var Subpart = function (id, label, connectorIds) {
  this.id = id
  this.label = label
  this.connectorIds = connectorIds || []
}

/**
 * Returns the connector ID at the given index
 * @param {number} index The index of the connector ID
 * @return {string} The connector ID at the given index
 */
Subpart.prototype.getConnectorIdAt = function (index) {
  return this.connectorIds[index]
}

/**
 * Adds a connector ID to this Subpart on the condition that it does not already exist
 * @param {string} connectorId The connector ID to be added
 */
Subpart.prototype.setConnectorId = function (connectorId) {
  if (!this.hasConnectorId(connectorId)) this.connectorIds.push(connectorId)
}

/**
 * Returns whether this Subpart has the given connector ID
 * @param {string} connectorId The given connector ID to search for
 * @return {boolean} Whether this Subpart has the given connector ID
 */
Subpart.prototype.hasConnectorId = function (connectorId) {
  var has = false
  for (var i = 0; i < this.connectorIds.length; i++) {
    if (this.connectorIds[i] === connectorId) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the given connector ID
 * @param {string} connectorId The connector ID to be removed
 * @return {boolean} Whether the given connector ID was removed
 */
Subpart.prototype.removeConnectorId = function (connectorId) {
  var removed = false
  for (var i = 0; i < this.connectorIds.length; i++) {
    if (this.connectorIds[i] === connectorId) {
      this.connectorIds.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the connector ID at the given index
 * @param {number} index The index of the connector ID
 * @return {boolean} Whether the connector ID at the given index was removed
 */
Subpart.prototype.removeConnectorIdAt = function (index) {
  return this.connectorIds.splice(index, 1).length > 0
}

/**
 * A Fritzing Part. In Fritzing, a Part is an abstract representation of a circuit component. This can be anything from a wire, to a sensor or microcontroller. The abstraction contains information regarding metadata, wire connections, buses (internal connections), suparts, and SVG image representations. **See the params documentation for parameter-specific definitions**
 * @constructor
 * @param {Object} [params = {}] The constructor parameters of this Part
 * @param {string} params.id The ID of this Part
 * @param {string} params.fritzingVersion The version of Fritzing associated with the reference FZP file
 * @param {string} params.referenceFile The reference FZP file for this Part
 * @param {string} params.author The author of this Part
 * @param {string} params.version The arbitrary version of this Part
 * @param {string} params.replacedBy The ID of the Part that renders this Part obselete
 * @param {string} params.title The title of this Part
 * @param {string} params.url An arbitrary URL associated with this Part
 * @param {string} params.label The arbitrary label of this Part. The parameter tends to be more categorical than the Part title, but less so than the taxonomy or family
 * @param {string} params.date The date that this Part was theoretically created
 * @param {string} params.description The description of this Part
 * @param {string} params.taxonomy The taxonomy of this Part. In FZP files, this is normally represented by period-delimited alphanumeric strings. **Example:** part.dip.14.pins
 * @param {string} params.language The language theoretically used to create this Part
 * @param {string} params.family The arbitrary Part family that this Part belongs to
 * @param {string} params.variant The name of this Part which makes it unique within its family. The parameter often references this Part's family by name
 * @param {string} params.defaultUnits The default units that this Part's dimensions are measured in
 * @param {string} [params.ignoreTerminalPoints = false] Whether to ignore the custom terminal points of this Part's {@link PartConnector}s in Fritzing. If **true**, the terminal points of this Part's {@link PartConnector}s default to their SVG connector center
 * @param {string[]} [params.tags = []] The categorical tags of this Part. Tags are often alphanumeric, with the occasional dash (-)
 * @param {PartProperty[]} [params.properties = [[]] The arbitrary properties of this Part
 * @param {PartViewSettings[]} [params.viewSettings = []] The {@link PartViewSettings} of this Part
 * @param {PartConnector[]} [params.connectors = []] The {@link PartConnector}s of this Part
 * @param {Bus[]} [params.buses = []] The {@link Bus}es of this Part
 * @param {Subpart[]} [params.subparts = []] The {@link Subpart}s of this Part
 */
var Part = function (params = {}) {
  this.moduleId = params.moduleId
  this.fritzingVersion = params.fritzingVersion
  this.referenceFile = params.referenceFile
  this.author = params.author
  this.version = params.version
  this.replacedBy = params.replacedBy
  this.title = params.title
  this.url = params.url
  this.label = params.label
  this.date = params.date
  this.description = params.description
  this.taxonomy = params.taxonomy
  this.language = params.language
  this.family = params.family
  this.variant = params.variant
  this.defaultUnits = params.defaultUnits
  this.ignoreTerminalPoints = params.ignoreTerminalPoints || false
  this.tags = params.tags || []
  this.properties = params.properties || []
  this.viewSettings = params.viewSettings || []
  this.connectors = params.connectors || []
  this.buses = params.buses || []
  this.subparts = params.subparts || []
}

/**
 * Returns the tag at the given index
 * @param {number} index The index of the tag
 * @return {string} The tag at the given index
 */
Part.prototype.getTagAt = function (index) {
  return this.tags[index]
}

/**
 * Adds a tag to this Part on the condition that it does not already exist
 * @param {string} tag The tag to be added
 */
Part.prototype.setTag = function (tag) {
  if (!this.hasTag(tag)) this.tags.push(tag)
}

/**
 * Returns whether this Part has the given tag
 * @param {string} tag The given tag to search for
 * @return {boolean} Whether this Part has the given tag
 */
Part.prototype.hasTag = function (tag) {
  var has = false
  for (var i = 0; i < this.tags.length; i++) {
    if (this.tags[i] === tag) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the given tag
 * @param {string} tag The tag to be removed
 * @return {boolean} Whether the given tag was removed
 */
Part.prototype.removeTag = function (tag) {
  var removed = false
  for (var i = 0; i < this.tags.length; i++) {
    if (this.tags[i] === tag) {
      this.tags.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the tag at the given index
 * @param {number} index The index of the tag
 * @return {boolean} Whether the tag at the given index was removed
 */
Part.prototype.removeTagAt = function (index) {
  return this.tags.splice(index, 1).length > 0
}

/**
 * Returns the {@link PartProperty} with the given name
 * @param {string} name The name of the {@link PartProperty}
 * @return {PartProperty} The {@link PartProperty} with the given name
 */
Part.prototype.getProperty = function (name) {
  var ret
  for (var i = 0; i < this.properties; i++) {
    if (this.properties[i].name === name) {
      ret = this.properties[i]
      break
    }
  }
  return ret
}

/**
 * Returns the {@link PartProperty} at the given index
 * @param {number} index The index of the {@link PartProperty}
 * @return {PartProperty} The {@link PartProperty} at the given index
 */
Part.prototype.getPropertyAt = function (index) {
  return this.properties[index]
}

/**
 * Adds a {@link PartProperty} to this Part on the condition that another {@link PartProperty} with the same name does not already exist
 * @param {PartProperty} property The {@link PartProperty} to be added
 */
Part.prototype.setProperty = function (property) {
  if (!this.hasProperty(property.name)) this.properties.push(property)
}

/**
 * Returns whether this Part has a {@link PartProperty} with the given name
 * @param {string} name The given name to search for
 * @return {boolean} Whether this Part has a {@link PartProperty} with the given name
 */
Part.prototype.hasProperty = function (name) {
  var has = false
  for (var i = 0; i < this.properties.length; i++) {
    if (this.properties[i].name === name) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the {@link PartProperty} with the given name
 * @param {string} name The name of the {@link PartProperty}
 * @return {boolean} Whether a {@link PartProperty} with the given name was removed
 */
Part.prototype.removeProperty = function (name) {
  var removed = false
  for (var i = 0; i < this.properties.length; i++) {
    if (this.properties[i].name === name) {
      this.properties.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the {@link PartProperty} at the given index
 * @param {number} index The index of the {@link PartProperty}
 * @return {boolean} Whether a {@link PartProperty} with the given index was removed
 */
Part.prototype.removePropertyAt = function (index) {
  return this.properties.splice(index, 1).length > 0
}

/**
 * Returns the {@link PartViewSettings} with the given name
 * @param {string} name The name of the {@link PartViewSettings}
 * @return {PartViewSettings} The {@link PartViewSettings} with the given name
 */
Part.prototype.getViewSettings = function (name) {
  var ret
  for (var i = 0; i < this.viewSettings; i++) {
    if (this.viewSettings[i].name === name) {
      ret = this.viewSettings[i]
      break
    }
  }
  return ret
}

/**
 * Returns the {@link PartViewSettings} at the given index
 * @param {number} index The index of the {@link PartViewSettings}
 * @return {PartViewSettings} The {@link PartViewSettings} at the given index
 */
Part.prototype.getViewSettingsAt = function (index) {
  return this.viewSettings[index]
}

/**
 * Adds a {@link PartViewSettings} to this Part on the condition that another {@link PartViewSettings} with the same name does not already exist
 * @param {PartViewSettings} viewSettings The {@link PartViewSettings} to be added
 */
Part.prototype.setViewSettings = function (viewSettings) {
  if (!this.hasViewSettings(viewSettings.name)) this.viewSettings.push(viewSettings)
}

/**
 * Returns whether this Part has a {@link PartViewSettings} with the given name
 * @param {string} name The given name to search for
 * @return {boolean} Whether this Part has a {@link PartViewSettings} with the given name
 */
Part.prototype.hasViewSettings = function (name) {
  var has = false
  for (var i = 0; i < this.viewSettings.length; i++) {
    if (this.viewSettings[i].name === name) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the {@link PartViewSettings} with the given name
 * @param {string} name The name of the {@link PartViewSettings}
 * @return {boolean} Whether a {@link PartViewSettings} with the given name was removed
 */
Part.prototype.removeViewSettings = function (name) {
  var removed = false
  for (var i = 0; i < this.viewSettings.length; i++) {
    if (this.viewSettings[i].name === name) {
      this.viewSettings.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the {@link PartViewSettings} at the given index
 * @param {number} index The index of the {@link PartViewSettings}
 * @return {boolean} Whether a {@link PartViewSettings} with the given index was removed
 */
Part.prototype.removeViewSettingsAt = function (index) {
  return this.viewSettings.splice(index, 1).length > 0
}

/**
 * Returns the {@link PartConnector} with the given ID
 * @param {string} id The ID of the {@link PartConnector}
 * @return {PartConnector} The {@link PartConnector} with the given ID
 */
Part.prototype.getConnector = function (id) {
  var ret
  for (var i = 0; i < this.connectors; i++) {
    if (this.connectors[i].id === id) {
      ret = this.connectors[i]
      break
    }
  }
  return ret
}

/**
 * Returns the {@link PartConnector} at the given index
 * @param {number} index The index of the {@link PartConnector}
 * @return {PartConnector} The {@link PartConnector} at the given index
 */
Part.prototype.getConnectorAt = function (index) {
  return this.connectors[index]
}

/**
 * Adds a {@link PartConnector} to this Part on the condition that another {@link PartConnector} with the same ID does not already exist
 * @param {PartConnector} connector The {@link PartConnector} to be added
 */
Part.prototype.setConnector = function (connector) {
  if (!this.hasConnector(connector.id)) this.connectors.push(connector)
}

/**
 * Returns whether this Part has a {@link PartConnector} with the given ID
 * @param {string} id The given ID to search for
 * @return {boolean} Whether this Part has a {@link PartConnector} with the given ID
 */
Part.prototype.hasConnector = function (id) {
  var has = false
  for (var i = 0; i < this.connectors.length; i++) {
    if (this.connectors[i].id === id) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the {@link PartConnector} with the given ID
 * @param {string} id The ID of the {@link PartConnector}
 * @return {boolean} Whether a {@link PartConnector} with the given ID was removed
 */
Part.prototype.removeConnector = function (id) {
  var removed = false
  for (var i = 0; i < this.connectors.length; i++) {
    if (this.connectors[i].id === id) {
      this.connectors.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the {@link PartConnector} at the given index
 * @param {number} index The index of the {@link PartConnector}
 * @return {boolean} Whether a {@link PartConnector} with the given index was removed
 */
Part.prototype.removeConnectorAt = function (index) {
  return this.connectors.splice(index, 1).length > 0
}

/**
 * Returns the {@link Bus} with the given ID
 * @param {string} id The ID of the {@link Bus}
 * @return {Bus} The {@link Bus} with the given ID
 */
Part.prototype.getBus = function (id) {
  var ret
  for (var i = 0; i < this.buses; i++) {
    if (this.buses[i].id === id) {
      ret = this.buses[i]
      break
    }
  }
  return ret
}

/**
 * Returns the {@link Bus} at the given index
 * @param {number} index The index of the {@link Bus}
 * @return {Bus} The {@link Bus} at the given index
 */
Part.prototype.getBusAt = function (index) {
  return this.buses[index]
}

/**
 * Adds a {@link Bus} to this Part on the condition that another {@link Bus} with the same ID does not already exist
 * @param {Bus} bus The {@link Bus} to be added
 */
Part.prototype.setBus = function (bus) {
  if (!this.hasBus(bus.id)) this.buses.push(bus)
}

/**
 * Returns whether this Part has a {@link Bus} with the given ID
 * @param {string} id The given ID to search for
 * @return {boolean} Whether this Part has a {@link Bus} with the given ID
 */
Part.prototype.hasBus = function (id) {
  var has = false
  for (var i = 0; i < this.buses.length; i++) {
    if (this.buses[i].id === id) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the {@link Bus} with the given ID
 * @param {string} id The ID of the {@link Bus}
 * @return {boolean} Whether a {@link Bus} with the given ID was removed
 */
Part.prototype.removeBus = function (id) {
  var removed = false
  for (var i = 0; i < this.buses.length; i++) {
    if (this.buses[i].id === id) {
      this.buses.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the {@link Bus} at the given index
 * @param {number} index The index of the {@link Bus}
 * @return {boolean} Whether a {@link Bus} with the given index was removed
 */
Part.prototype.removeBusAt = function (index) {
  return this.buses.splice(index, 1).length > 0
}

/**
 * Returns the {@link Subpart} with the given ID
 * @param {string} id The ID of the {@link Subpart}
 * @return {Subpart} The {@link Subpart} with the given ID
 */
Part.prototype.getSubpart = function (id) {
  var ret
  for (var i = 0; i < this.subparts; i++) {
    if (this.subparts[i].id === id) {
      ret = this.subparts[i]
      break
    }
  }
  return ret
}

/**
 * Returns the {@link Subpart} at the given index
 * @param {number} index The index of the {@link Subpart}
 * @return {Subpart} The {@link Subpart} at the given index
 */
Part.prototype.getSubpartAt = function (index) {
  return this.subparts[index]
}

/**
 * Adds a {@link Subpart} to this Part on the condition that another {@link Subpart} with the same ID does not already exist
 * @param {Subpart} subpart The {@link Subpart} to be added
 */
Part.prototype.setSubpart = function (subpart) {
  if (!this.hasSubpart(subpart.id)) this.subparts.push(subpart)
}

/**
 * Returns whether this Part has a {@link Subpart} with the given ID
 * @param {string} id The given ID to search for
 * @return {boolean} Whether this Part has a {@link Subpart} with the given ID
 */
Part.prototype.hasSubpart = function (id) {
  var has = false
  for (var i = 0; i < this.subparts.length; i++) {
    if (this.subparts[i].id === id) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the {@link Subpart} with the given ID
 * @param {string} id The ID of the {@link Subpart}
 * @return {boolean} Whether a {@link Subpart} with the given ID was removed
 */
Part.prototype.removeSubpart = function (id) {
  var removed = false
  for (var i = 0; i < this.subparts.length; i++) {
    if (this.subparts[i].id === id) {
      this.subparts.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the {@link Subpart} at the given index
 * @param {number} index The index of the {@link Subpart}
 * @return {boolean} Whether a {@link Subpart} with the given index was removed
 */
Part.prototype.removeSubpartAt = function (index) {
  return this.subparts.splice(index, 1).length > 0
}

/**
 * Returns this Part as a string of FZP XML
 * @return {Promise} This Part as a string of FZP XML
 */
Part.prototype.toFZP = function () {
  var i = 0
  var j = 0
  var moduleLayers
  var viewSetting
  var layers
  var layer
  var moduleConnectors
  var connectors

  function setOptionalValue (obj, key, value) {
    if (value) {
      obj[key] = value
    }
  }

  var module = {
    $: {
      moduleId: this.moduleId
    },
    title: this.title,
    views: {}
  }
  if (this.version) {
    module.version = {
      _: this.version
    }
    if (this.replacedBy) {
      module.version.$ = {
        replacedby: this.replacedBy
      }
    }
  }
  setOptionalValue(module.$, 'fritzingVersion', this.fritzingVersion)
  setOptionalValue(module.$, 'referenceFile', this.referenceFile)
  setOptionalValue(module, 'author', this.author)
  setOptionalValue(module, 'label', this.label)
  setOptionalValue(module, 'description', this.description)
  setOptionalValue(module, 'url', this.url)
  setOptionalValue(module, 'date', this.date)
  setOptionalValue(module, 'taxonomy', this.taxonomy)
  setOptionalValue(module, 'language', this.language)
  setOptionalValue(module, 'family', this.family)
  setOptionalValue(module, 'variant', this.variant)

  if (this.tags.length > 0) {
    module.tags = {
      tag: []
    }
    var moduleTags = module.tags.tag
    var tags = this.tags
    for (i = 0; i < tags.length; i++) {
      moduleTags.push({
        _: tags[i]
      })
    }
  }

  if (this.properties.length > 0) {
    module.properties = {
      property: []
    }
    var moduleProperties = module.properties.property
    var properties = this.properties
    for (i = 0; i < properties.length; i++) {
      var property = properties[i]
      var moduleProperty = {
        $: {
          name: property.name,
          showInLabel: property.showInLabel
        }
      }
      setOptionalValue(moduleProperty, '_', property.value)
      moduleProperties.push(moduleProperty)
    }
  }

  var moduleViews = module.views
  var viewSettings = this.viewSettings
  for (i = 0; i < viewSettings.length; i++) {
    var moduleLayersArray = []
    viewSetting = viewSettings[i]
    layers = viewSetting.layers
    for (j = 0; j < layers.length; j++) {
      layer = layers[j]
      moduleLayersArray.push({
        $: {
          layerId: layer.id,
          sticky: layer.sticky
        }
      })
    }
    moduleLayers = {
      layer: moduleLayersArray
    }
    if (viewSetting.image) {
      moduleLayers.$ = {
        image: viewSetting.image
      }
    }
    moduleViews[viewSetting.name + 'View'] = {
      $: {
        fliphorizontal: viewSetting.flipHorizontal,
        flipvertical: viewSetting.flipVertical
      },
      layers: moduleLayers
    }
  }
  setOptionalValue(moduleViews, 'defaultUnits', this.defaultUnits)

  if (this.connectors.length > 0) {
    module.connectors = {
      $: {
        ignoreTerminalPoints: this.ignoreTerminalPoints
      },
      connector: []
    }
    moduleConnectors = module.connectors.connector
    connectors = this.connectors
    for (i = 0; i < connectors.length; i++) {
      var moduleViews1 = {}
      var connector = connectors[i]
      var viewSettings1 = connector.viewSettings
      for (j = 0; j < viewSettings1.length; j++) {
        moduleLayers = []
        viewSetting = viewSettings1[j]
        layers = viewSetting.layerSettings
        for (var c = 0; c < layers.length; c++) {
          layer = layers[c]
          var moduleLayer = {
            $: {
              layer: layer.name,
              svgId: layer.svgId,
              hybrid: layer.disabled
            }
          }
          setOptionalValue(moduleLayer, 'terminalId', layer.terminalId)
          setOptionalValue(moduleLayer, 'legId', layer.legId)
          moduleLayers.push(moduleLayer)
        }
        moduleViews1[viewSetting.name + 'View'] = {
          p: moduleLayers
        }
      }
      var moduleConnector = {
        $: {
          id: connector.id,
          name: connector.name,
          type: connector.type
        },
        views: moduleViews1
      }
      setOptionalValue(moduleConnector.$, 'replacedby', connector.replacedby)
      setOptionalValue(moduleConnector, 'description', connector.description)
      if (connector.erc) {
        var erc = connector.erc
        moduleConnector.erc = {
          $: {}
        }
        var moduleERC = moduleConnector.erc
        setOptionalValue(moduleERC.$, 'etype', erc.type)
        setOptionalValue(moduleERC.$, 'ignore', erc.ignore)
        if (erc.voltage) {
          moduleERC.voltage = {
            $: {
              value: erc.voltage
            }
          }
        }
        if (erc.current) {
          var current = erc.current
          moduleERC.current = {
            $: {
              flow: current.flow,
              valueMax: current.valueMax
            }
          }
        }
      }
      moduleConnectors.push(moduleConnector)
    }
  }

  if (this.buses.length > 0) {
    module.buses = {
      bus: []
    }
    var moduleBuses = module.buses.bus
    var buses = this.buses
    for (i = 0; i < buses.length; i++) {
      moduleConnectors = []
      var bus = buses[i]
      connectors = bus.connectorIds
      for (j = 0; j < connectors.length; j++) {
        moduleConnectors.push({
          $: {
            connectorId: connectors[j]
          }
        })
      }
      var moduleBus = {
        nodeMember: moduleConnectors
      }
      if (bus.id) {
        moduleBus.$ = {
          id: bus.id
        }
      }
      moduleBuses.push(moduleBus)
    }
  }

  if (this.subparts.length > 0) {
    module.subparts = {
      subpart: []
    }
    var moduleSubparts = module.subparts.subpart
    var subparts = this.subparts
    for (i = 0; i < subparts.length; i++) {
      moduleConnectors = []
      var subpart = subparts[i]
      connectors = subpart.connectorIds
      for (j = 0; j < connectors.length; j++) {
        moduleConnectors.push({
          $: {
            id: connectors[j]
          }
        })
      }
      moduleSubparts.push({
        $: {
          id: subpart.id,
          label: subpart.label
        },
        connectors: {
          connector: moduleConnectors
        }
      })
    }
  }

  return new xml2js.Builder().buildObject(({
    module: module
  }))
}

/**
 * @static
 * Returns the given Part as a string of FZP XML
 * @param {Part} part The given Part
 * @return {Promise} The given Part as a string of FZP XML
 */
Part.toFZP = function (part) {
  return part.toFZP()
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
        var module = data.module

        var moduleVersion = getOptionalValue(module.version)
        var moduleReplacedBy
        if (moduleVersion) {
          moduleReplacedBy = getOptionalAttribute(module.version[0], 'replacedby')
        }

        var tags = []
        if (module.tags && module.tags[0].tag) {
          var moduleTags = module.tags[0].tag
          for (i = 0; i < moduleTags.length; i++) {
            tags.push(moduleTags[i]._)
          }
        }

        var properties = []
        if (module.properties && module.properties[0].property) {
          var moduleProperties = module.properties[0].property
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
        var moduleViewKeys = Object.keys(module.views[0])
        for (i = 0; i < moduleViewKeys.length; i++) {
          moduleViewKey = moduleViewKeys[i]
          if (moduleViewKey.endsWith('View')) {
            moduleView = module.views[0][moduleViewKey][0]
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
        if (module.connectors && module.connectors[0].connector) {
          moduleConnectors = module.connectors[0].connector
          ignoreTerminalPoints = getOptionalAttribute(module.connectors[0], 'ignoreTerminalPoints') === 'true'
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
        if (module.buses && module.buses[0].bus) {
          var moduleBuses = module.buses[0].bus
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
        if (module['schematic-subparts'] && module['schematic-subparts'][0].subpart) {
          var moduleSubparts = module['schematic-subparts'][0].subpart
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
          moduleId: module.$.moduleId,
          title: module.title[0]._,
          fritzingVersion: getOptionalAttribute(module, 'fritzingVersion'),
          referenceFile: getOptionalAttribute(module, 'referenceFile'),
          version: moduleVersion,
          replacedBy: moduleReplacedBy,
          author: getOptionalValue(module.author),
          label: getOptionalValue(module.label),
          description: getOptionalValue(module.description),
          url: getOptionalValue(module.url),
          date: getOptionalValue(module.date),
          taxonomy: getOptionalValue(module.taxonomy),
          language: getOptionalValue(module.language),
          family: getOptionalValue(module.family),
          variant: getOptionalValue(module.variant),
          defaultUnits: getOptionalValue(module.views[0].defaultUnits),
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

module.exports = {
  PartProperty: PartProperty,
  PartLayer: PartLayer,
  PartViewSettings: PartViewSettings,
  Current: Current,
  ERC: ERC,
  PartConnectorLayerSettings: PartConnectorLayerSettings,
  PartConnectorViewSettings: PartConnectorViewSettings,
  PartConnector: PartConnector,
  Bus: Bus,
  Subpart: Subpart,
  Part: Part
}
