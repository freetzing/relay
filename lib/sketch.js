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

var { Property, Point } = require('./global')
var xml2js = require('xml2js')

/**
 * @constructor
 * A Bezier curve used to represent a bend in the leg of a Part {@link Instance}
 * @param {Point} cp0 The first control point of the Bezier curve
 * @param {Point} cp1 The second control point of the Bezier curve
 */
var Bezier = function (cp0, cp1) {
  this.cp0 = cp0
  this.cp1 = cp1
}

/**
 * @constructor
 * A {@link Bezier} and a {@link Point} object paired together to represent the state of a Part {@link Instance} leg
 * @param {Point} point The {@link Point} data
 * @param {Bezier} bezier The {@link Bezier} data
 */
var PointBezierPair = function (point, bezier) {
  this.point = point
  this.bezier = bezier
}

/**
 * @constructor
 * @extends Point
 * A three-dimensional {@link Point} in virtual space
 * @param {number} x The x-coordinate of this Geometry
 * @param {number} y The y-coordinate of this Geometry
 * @param {number} z The z-coordinate of this Geometry, denoting whether an object in virtual space is above or below another. Objects with a higher z value are rendered above
 */
var Geometry = function (x, y, z) {
  Point.call(this, x, y)
  this.z = z
}

/**
 * @constructor
 * Describes transformations to an object in two-dimensional, virtual space through a 3x3 matrix
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
var Transform = function (params = {}) {
  this.m11 = params.m11 || 1
  this.m12 = params.m12 || 0
  this.m13 = params.m13 || 0
  this.m21 = params.m21 || 0
  this.m22 = params.m22 || 1
  this.m23 = params.m23 || 0
  this.m31 = params.m31 || 0
  this.m32 = params.m32 || 0
  this.m33 = params.m33 || 1
}

/**
 * @constructor
 * @extends Geometry
 * An object's position and transformation in three-dimensional space
 * @param {number} x The x-coordinate of the TransformGeometry
 * @param {number} y The y-coordinate of the TransformGeometry
 * @param {number} z The z-coordinate of the TransformGeometry. See {@link Geometry} for the purpose of the z-coordinate in a two-dimensional, virtual space
 * @param {Transform} transform The {@link Transform} matrix describing the object's transformation from its original state
 */
var TransformGeometry = function (x, y, z, transform) {
  Geometry.call(this, x, y, z)
  this.transform = transform
}

/**
 * @constructor
 * @extends Geometry
 * The {@link Geometry} for a wire in virtual space
 * @param {object} [params = {}] The constructor parameters for this WireGeometry
 * @param {number} params.x The x-coordinate of the WireGeometry
 * @param {number} params.y The y-coordinate of the WireGeometry
 * @param {number} params.z The z-coordinate of the WireGeometry. See {@link Geometry} for the purpose of the z-coordinate in a two-dimensional, virtual space
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
var WireGeometry = function (params = {}) {
  Geometry.call(this, params.x, params.y, params.z)
  this.x1 = params.x1 || 0
  this.y1 = params.y1 || 0
  this.x2 = params.x2
  this.y2 = params.y2
  this.wireFlags = params.wireFlags
}

/**
 * @constructor
 * @extends Geometry
 * The {@link Geometry} for a Part {@link Instance}'s title
 * @param {object} [params = {}] The constructor parameters for this TitleGeometry
 * @param {number} params.x The x-coordinate of the TitleGeometry
 * @param {number} params.y The y-coordinate of the TitleGeometry
 * @param {number} params.z The z-coordinate of the TitleGeometry. See {@link Geometry} for the purpose of the z-coordinate in a two-dimensional, virtual space
 * @param {boolean} [params.visible = false] Whether the title is visible
 * @param {number} [params.offsetX = 0] The offset of the title's x-coordinate from the given x-coordinate of this TitleGeometry
 * @param {number} [params.offsetY = 0] The offset of the title's y-coordinate from the given y-coordinate of this TitleGeometry
 * @param {string} params.textColor The color of the title's text as a 6 digit hexidecimal value denoted by the pound (#) sign
 * @param {string} params.fontSize The font size of the title
 * @param {string[]} [params.visibleProperties = []] The keys of the {@link PartProperty}'s' to be forcibly displayed with the title. If this array is left empty, those {@link PartProperty}'s with **showInLabel=true** will be displayed by default
 */
var TitleGeometry = function (params = {}) {
  Geometry.call(this, params.x, params.y, params.z)
  this.visible = params.visible || true
  this.offsetX = params.offsetX
  this.offsetY = params.offsetY
  this.textColor = params.textColor
  this.fontSize = params.fontSize
  this.visibleProperties = params.visibleProperties || []
}

/**
 * Returns the visible property at the given index
 * @param {number} index The index of the visible property
 * @return {string} The visible property at the given index
 */
TitleGeometry.prototype.getVisiblePropertyAt = function (index) {
  return this.visibleProperties[index]
}

/**
 * Adds a visible property to this TitleGeometry on the condition that it does not already exist
 * @param {string} visibleProperty The visible property to be added
 */
TitleGeometry.prototype.setVisibleProperty = function (visibleProperty) {
  if (!this.hasVisibleProperty(visibleProperty)) this.visibleProperties.push(visibleProperty)
}

/**
 * Returns whether this TitleGeometry has the given visible property
 * @param {string} visibleProperty The given visible property to search for
 * @return {boolean} Whether this TitleGeometry has the given visible property
 */
TitleGeometry.prototype.hasVisibleProperty = function (visibleProperty) {
  var has = false
  for (var i = 0; i < this.visibleProperties.length; i++) {
    if (this.visibleProperties[i] === visibleProperty) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the given visible property
 * @param {string} visibleProperty The visible property to be removed
 * @return {boolean} Whether the given visible property was removed
 */
TitleGeometry.prototype.removeVisibleProperty = function (visibleProperty) {
  var removed = false
  for (var i = 0; i < this.visibleProperties.length; i++) {
    if (this.visibleProperties[i] === visibleProperty) {
      this.visibleProperties.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the visible property at the given index
 * @param {number} index The index of the visible property
 * @return {boolean} Whether the visible property at the given index was removed
 */
TitleGeometry.prototype.removeVisiblePropertyAt = function (index) {
  return this.visibleProperties.splice(index, 1).length > 0
}

/**
 * @constructor
 * A reference to the connector of another Part {@link Instance}
 * @param {string} id The ID of the {@link InstanceConnector} of the remote {@link Instance}
 * @param {number} modelIndex The unique index of the {@link Instance} containing the referenced {@link InstanceConnector}
 * @param {string} layer The layer of the connection
 */
var InstanceConnectorReference = function (id, modelIndex, layer) {
  this.id = id
  this.modelIndex = modelIndex
  this.layer = layer
}

/**
 * @constructor
 * A {@link Part} connector of an {@link Instance} that has either established connections or sketch-dependent properties
 * @param {object} [params = {}] The constructor parameters for this InstanceConnector
 * @param {string} params.id The ID of this InstanceConnector
 * @param {string} params.layer The layer of this InstanceConnector
 * @param {Geometry} params.geometry The {@link Geometry} of this InstanceConnector
 * @param {PointBezierPair[]} [params.leg = []] The bendable or straight leg of an InstanceConnector such as an LED, represented by {@link PointBezierPair}s
 * @param {InstanceConnectorReference][]} [params.connectsTo = []] The {@link InstanceConnectorReference}s that this Instance connects to
 */
var InstanceConnector = function (params = {}) {
  this.id = params.id
  this.layer = params.layer
  this.geometry = params.geometry
  this.leg = params.leg || []
  this.connectsTo = params.connectsTo || []
}

/**
 * Returns the leg data point at the given index
 * @param {number} index The index of the leg data point
 * @return {PointBezierPair} The leg data point at the given index
 */
InstanceConnector.prototype.getLegDataPointAt = function (index) {
  return this.leg[index]
}

/**
 * Adds a leg data point to this InstanceConnector on the condition that it does not already exist
 * @param {PointBezierPair} legDataPoint The leg data point to be added
 */
InstanceConnector.prototype.setLegDataPoint = function (legDataPoint) {
  if (!this.hasLegDataPoint(legDataPoint)) this.leg.push(legDataPoint)
}

/**
 * Returns whether this InstanceConnector has the given leg data point
 * @param {PointBezierPair} legDataPoint The given leg data point to search for
 * @return {boolean} Whether this InstanceConnector has the given leg data point
 */
InstanceConnector.prototype.hasLegDataPoint = function (legDataPoint) {
  var has = false
  for (var i = 0; i < this.leg.length; i++) {
    if (this.leg[i] === legDataPoint) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the given leg data point
 * @param {PointBezierPair} legDataPoint The leg data point to be removed
 * @return {boolean} Whether the given leg data point was removed
 */
InstanceConnector.prototype.removeLegDataPoint = function (legDataPoint) {
  var removed = false
  for (var i = 0; i < this.leg.length; i++) {
    if (this.leg[i] === legDataPoint) {
      this.leg.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the leg data point at the given index
 * @param {number} index The index of the leg data point
 * @return {boolean} Whether the leg data point at the given index was removed
 */
InstanceConnector.prototype.removeLegDataPointAt = function (index) {
  return this.leg.splice(index, 1).length > 0
}

/**
 * Returns the {@link InstanceConnectorReference} with the given ID
 * @param {string} id The ID of the {@link InstanceConnectorReference}
 * @return {InstanceConnectorReference} The {@link InstanceConnectorReference} with the given ID
 */
InstanceConnector.prototype.getConnectorReference = function (id) {
  var ret
  for (var i = 0; i < this.connectsTo; i++) {
    if (this.connectsTo[i].id === id) {
      ret = this.connectsTo[i]
      break
    }
  }
  return ret
}

/**
 * Returns the {@link InstanceConnectorReference} at the given index
 * @param {number} index The index of the {@link InstanceConnectorReference}
 * @return {InstanceConnectorReference} The {@link InstanceConnectorReference} at the given index
 */
InstanceConnector.prototype.getConnectorReferenceAt = function (index) {
  return this.connectsTo[index]
}

/**
 * Adds a {@link InstanceConnectorReference} to this InstanceConnector on the condition that another {@link InstanceConnectorReference} with the same ID does not already exist
 * @param {InstanceConnectorReference} connectorReference The {@link InstanceConnectorReference} to be added
 */
InstanceConnector.prototype.setConnectorReference = function (connectorReference) {
  if (!this.hasConnectorReference(connectorReference.id)) this.connectsTo.push(connectorReference)
}

/**
 * Returns whether this InstanceConnector has a {@link InstanceConnectorReference} with the given ID
 * @param {string} id The given ID to search for
 * @return {boolean} Whether this InstanceConnector has a {@link InstanceConnectorReference} with the given ID
 */
InstanceConnector.prototype.hasConnectorReference = function (id) {
  var has = false
  for (var i = 0; i < this.connectsTo.length; i++) {
    if (this.connectsTo[i].id === id) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the {@link InstanceConnectorReference} with the given ID
 * @param {string} id The ID of the {@link InstanceConnectorReference}
 * @return {boolean} Whether a {@link InstanceConnectorReference} with the given ID was removed
 */
InstanceConnector.prototype.removeConnectorReference = function (id) {
  var removed = false
  for (var i = 0; i < this.connectsTo.length; i++) {
    if (this.connectsTo[i].id === id) {
      this.connectsTo.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the {@link InstanceConnectorReference} at the given index
 * @param {number} index The index of the {@link InstanceConnectorReference}
 * @return {boolean} Whether a {@link InstanceConnectorReference} at the given index was removed
 */
InstanceConnector.prototype.removeConnectorReferenceAt = function (index) {
  return this.connectsTo.splice(index, 1).length > 0
}

/**
 * @constructor
 * The view settings for an {@link Instance} in Fritzing
 * @param {object} [params = {}] The constructor parameters for these InstanceViewSettings
 * @param {string} params.name The name of the view associated with these InstanceViewSettings. The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**
 * @param {string} params.layer The layer that these InstanceViewSettings are on inside the given view
 * @param {Geometry} params.geometry The {@link Geometry} of the corresponding {@link Instance} in the given view and layer
 * @param {TitleGeometry} params.titleGeometry The {@link TitleGeometry} of the corresponding {@link Instance} in the given view and layer
 * @param {InstanceConnector[]} [params.connectors = []] The {@link InstanceConnector}s for the corresponding {@link Instance} in the given view and layer
 * @param {boolean} [params.locked = false] Seems to prevent the corresponding {@link Instance} from moving in the given view and layer. Confirmation of this variable's purpose would be much appreciated
 * @param {boolean} [params.bottom = false] Seems to denote whether the corresponding {@link Instance} sticks to the "bottom" in the PCB view. Confirmation of this variable's purpose would be much appreciated
 * @param {boolean} [params.layerHidden = false] Seem to hide the corresponding {@link Instance} for silkscreen layers in the PCB view. Confirmation of this variable's purpose would be much appreciated
 */
var InstanceViewSettings = function (params = {}) {
  this.name = params.name
  this.layer = params.layer
  this.geometry = params.geometry
  this.titleGeometry = params.titleGeometry
  this.connectors = params.connectors || []
  this.bottom = params.bottom || false
  this.locked = params.locked || false
  this.layerHidden = params.layerHidden || false
}

/**
 * Returns the {@link InstanceConnector} with the given ID
 * @param {string} id The ID of the {@link InstanceConnector}
 * @return {InstanceConnector} The {@link InstanceConnector} with the given ID
 */
InstanceViewSettings.prototype.getConnector = function (id) {
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
 * Returns the {@link InstanceConnector} at the given index
 * @param {number} index The index of the {@link InstanceConnector}
 * @return {InstanceConnector} The {@link InstanceConnector} at the given index
 */
InstanceViewSettings.prototype.getConnectorAt = function (index) {
  return this.connectors[index]
}

/**
 * Adds a {@link InstanceConnector} to these InstanceViewSettings on the condition that another {@link InstanceConnector} with the same ID does not already exist
 * @param {InstanceConnector} instanceConnector The {@link InstanceConnector} to be added
 */
InstanceViewSettings.prototype.setConnector = function (instanceConnector) {
  if (!this.hasConnector(instanceConnector.id)) this.connectors.push(instanceConnector)
}

/**
 * Returns whether these InstanceViewSettings have a {@link InstanceConnector} with the given ID
 * @param {string} id The given ID to search for
 * @return {boolean} Whether these InstanceViewSettings have a {@link InstanceConnector} with the given ID
 */
InstanceViewSettings.prototype.hasConnector = function (id) {
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
 * Removes the {@link InstanceConnector} with the given ID
 * @param {string} id The ID of the {@link InstanceConnector}
 * @return {boolean} Whether a {@link InstanceConnector} with the given ID was removed
 */
InstanceViewSettings.prototype.removeConnector = function (id) {
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
 * Removes the {@link InstanceConnector} at the given index
 * @param {number} index The index of the {@link InstanceConnector}
 * @return {boolean} Whether a {@link InstanceConnector} at the given index was removed
 */
InstanceViewSettings.prototype.removeConnectorAt = function (index) {
  return this.connectors.splice(index, 1).length > 0
}

/**
 * @constructor
 * The additional settings for a wire {@link Instance}
 * @param {object} [params = {}] The constructor parameters for these WireExtras
 * @param {number} params.mils The thickness of the wire in milli-inches
 * @param {string} params.color The color of the wire as a 6 digit hexidecimal value denoted by the pound (#) sign
 * @param {number} params.opacity The opacity of the wire as a decimal value from 0 to 1
 * @param {boolean} [params.banded = false] Whether to display the wire with alternating bands of the given color and white in breadboard view
 * @param {Bezier} params.bezier Appears to be the Bezier curve used to describe the curvature of this wire {@link Instance} in breadboard view. Confirmation of this variable's purpose would be much appreciated
 */
var WireExtras = function (params = {}) {
  this.mils = params.mils
  this.color = params.color
  this.opacity = params.opacity
  this.banded = params.banded || false
  this.bezier = params.bezier
}

/**
 * @constructor
 * The view settings for a wire {@link Instance} in Fritzing
 * @param {object} [params = {}] The constructor parameters for these WireInstanceViewSettings
 * @param {string} params.name The name of the view associated with these WireInstanceViewSettings. The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**
 * @param {string} params.layer The layer that these WireInstanceViewSettings are on inside the given view
 * @param {Geometry} params.geometry The {@link Geometry} of the corresponding wire {@link Instance} in the given view and layer
 * @param {TitleGeometry} params.titleGeometry The {@link TitleGeometry} of the corresponding wire {@link Instance} in the given view and layer
 * @param {InstanceConnector[]} [params.connectors = []] The {@link InstanceConnector}s for the corresponding wire {@link Instance} in the given view and layer
 * @param {boolean} [params.locked = false] Seems to prevent the corresponding wire {@link Instance} from moving in the given view and layer. Confirmation of this variable's purpose would be much appreciated
 * @param {boolean} [params.bottom = false] Seems to denote whether the corresponding wire {@link Instance} sticks to the "bottom" in the PCB view. Confirmation of this variable's purpose would be much appreciated
 * @param {boolean} [params.layersHidden = false] Seem to hide the corresponding wire {@link Instance} for silkscreen layers in the PCB view. Confirmation of this variable's purpose would be much appreciated
 * @param {WireExtras} params.wireExtras The additional settings for this wire {@link Instance}. See {@link WireExtras} for more
 */
var WireInstanceViewSettings = function (params = {}) {
  InstanceViewSettings.call(this, params)
  this.wireExtras = params.wireExtras
}

WireInstanceViewSettings.prototype = InstanceViewSettings.prototype
Object.defineProperty(WireInstanceViewSettings.prototype, 'constructor', {
  value: WireInstanceViewSettings,
  enumerable: false,
  writable: true
})

/**
 * @constructor
 * Appears to be a local connector within a {@link Instance} that cannot interact with other connectors outside the {@link Instance}. Confirmation of this variable's purpose would be much appreciated
 * @param {string} id The ID of this LocalConnector
 * @param {string} name The name of this LocalConnector
 */
var LocalConnector = function (id, name) {
  this.id = id
  this.name = name
}

/**
 * @constructor
 * An instance of a {@link Part} within a {@link Sketch}
 * @param {object} [params = {}] The constructor parameters for this Instance
 * @param {string} params.moduleIdRef The module ID of the corresponding {@link Part}
 * @param {string} params.modelIndex The unique index of this Instance within a {@link Sketch}
 * @param {string} params.path The relative path to the corresponding {@link Part}. This variable is only a "hint", and has no real use in the Fritzing app
 * @param {Property[]} [params.properties = []] The {@link Property}'s of this Instance
 * @param {string} params.title The title of this Instance
 * @param {InstanceViewSettings} params.viewSettings The {@link InstanceViewSettings} of this Instance
 * @param {string} params.text Appears to be some arbitrary text associated with this Instance. Clarifaction of this variable's purpose would be much appreciated
 * @param {boolean} [params.flippedSMD = false] Appears to decide whether a SMD (Surface Mount Device) Instance is flipped. Confirmation of this variable's purpose would be much appreciated
 * @param {LocalConnector[]} [params.localConnectors = []] The {@link LocalConnector}s of this Instance
 */
var Instance = function (params = {}) {
  this.moduleIdRef = params.moduleIdRef
  this.modelIndex = params.modelIndex
  this.path = params.path
  this.properties = params.properties || []
  this.title = params.title
  this.viewSettings = params.viewSettings || []
  this.text = params.text
  this.flippedSMD = params.flippedSMD || false
  this.localConnectors = params.localConnectors || []
}

/**
 * Returns the {@link Property} with the given name
 * @param {string} name The name of the {@link Property}
 * @return {Property} The {@link Property} with the given name
 */
Instance.prototype.getProperty = function (name) {
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
 * Returns the {@link Property} at the given index
 * @param {number} index The index of the {@link Property}
 * @return {Property} The {@link Property} at the given index
 */
Instance.prototype.getPropertyAt = function (index) {
  return this.properties[index]
}

/**
 * Adds a {@link Property} to this Instance on the condition that another {@link Property} with the same name does not already exist
 * @param {Property} property The {@link Property} to be added
 */
Instance.prototype.setProperty = function (property) {
  if (!this.hasProperty(property.name)) this.properties.push(property)
}

/**
 * Returns whether this Instance has a {@link Property} with the given name
 * @param {string} name The given name to search for
 * @return {boolean} Whether this Instance has a {@link Property} with the given name
 */
Instance.prototype.hasProperty = function (name) {
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
 * Removes the {@link Property} with the given name
 * @param {string} name The name of the {@link Property}
 * @return {boolean} Whether a {@link Property} with the given name was removed
 */
Instance.prototype.removeProperty = function (name) {
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
 * Removes the {@link Property} at the given index
 * @param {number} index The index of the {@link Property}
 * @return {boolean} Whether a {@link Property} at the given index was removed
 */
Instance.prototype.removePropertyAt = function (index) {
  return this.properties.splice(index, 1).length > 0
}

/**
 * Returns the {@link LocalConnector} with the given ID
 * @param {string} id The ID of the {@link LocalConnector}
 * @return {LocalConnector} The {@link LocalConnector} with the given ID
 */
Instance.prototype.getLocalConnector = function (id) {
  var ret
  for (var i = 0; i < this.localConnectors; i++) {
    if (this.localConnectors[i].id === id) {
      ret = this.localConnectors[i]
      break
    }
  }
  return ret
}

/**
 * Returns the {@link LocalConnector} at the given index
 * @param {number} index The index of the {@link LocalConnector}
 * @return {LocalConnector} The {@link LocalConnector} at the given index
 */
Instance.prototype.getLocalConnectorAt = function (index) {
  return this.localConnectors[index]
}

/**
 * Adds a {@link LocalConnector} to this Instance on the condition that another {@link LocalConnector} with the same ID does not already exist
 * @param {LocalConnector} localConnector The {@link LocalConnector} to be added
 */
Instance.prototype.setLocalConnector = function (localConnector) {
  if (!this.hasLocalConnector(localConnector.id)) this.localConnectors.push(localConnector)
}

/**
 * Returns whether this Instance has a {@link LocalConnector} with the given ID
 * @param {string} id The given ID to search for
 * @return {boolean} Whether this Instance has a {@link LocalConnector} with the given ID
 */
Instance.prototype.hasLocalConnector = function (id) {
  var has = false
  for (var i = 0; i < this.localConnectors.length; i++) {
    if (this.localConnectors[i].id === id) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the {@link LocalConnector} with the given ID
 * @param {string} id The ID of the {@link LocalConnector}
 * @return {boolean} Whether a {@link LocalConnector} with the given ID was removed
 */
Instance.prototype.removeLocalConnector = function (id) {
  var removed = false
  for (var i = 0; i < this.localConnectors.length; i++) {
    if (this.localConnectors[i].id === id) {
      this.localConnectors.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the {@link LocalConnector} at the given index
 * @param {number} index The index of the {@link LocalConnector}
 * @return {boolean} Whether a {@link LocalConnector} at the given index was removed
 */
Instance.prototype.removeLocalConnectorAt = function (index) {
  return this.localConnectors.splice(index, 1).length > 0
}

/**
 * @constructor
 * A program file
 * @param {string} pid The unique ID of a Fritzing application used here to decide whether this Program should be accessed via FZZ or its full path. If the given PID matches the Fritzing application opening this Program, then the full path is used
 * @param {string} language The programming language that this Program is written in
 * @param {string} author The author of this Program
 * @param {string} path The path to this Program in the file system
 */
var Program = function (pid, language, author, path) {
  this.pid = pid
  this.language = language
  this.author = author
  this.path = path
}

/**
 * @constructor
 * A PCB (Printed Circuit Board) in a {@link Sketch}
 * @param {object} [params = {}] The constructor parameters for this Board
 * @param {string} params.moduleId The module ID of the {@link Part} associated with this Board
 * @param {string} params.title The title of this Board
 * @param {string} params.instance The title of the {@link Instance} associated with this Board
 * @param {string} params.width The width of this Board in virtual space
 * @param {string} params.height The height of this Board in virtual space
 */
var Board = function (params = {}) {
  this.moduleId = params.moduleId
  this.title = params.title
  this.instance = params.instance
  this.width = params.width
  this.height = params.height
}

/**
 * @constructor
 * The view settings for a {@link Sketch} in Fritzing
 * @param {object} [params = {}] The constructor parameters for these SketchViewSettings
 * @param {string} params.name The name of the view associated with these SketchViewSettings. The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**
 * @param {string} params.backgroundColor The background color of the associated view as a 6 digit hexidecimal value denoted by the pound (#) sign
 * @param {string} params.gridSize The width and height of a square in the associated view's grid
 * @param {boolean} [params.showGrid = true] Whether to show the grid in the associated view
 * @param {boolean} [params.alignToGrid = false] Whether a {@link Sketch} should be aligned to the grid of the associated view
 * @param {viewFromBelow} [params.viewFromBelow = false] Appears to decide whether a {@link Sketch} can be viewed from below. Confirmation of this variable's purpose would be much appreciated
 */
var SketchViewSettings = function (params = {}) {
  this.name = params.name
  this.backgroundColor = params.backgroundColor
  this.gridSize = params.gridSize
  this.showGrid = params.showGrid || true
  this.alignToGrid = params.alignToGrid || false
  this.viewFromBelow = params.viewFromBelow || false
}

/**
 * @constructor
 * The PCB view settings for a {@link Sketch} in Fritzing
 * @param {object} [params = {}] The constructor parameters for these SketchPCBViewSettings
 * @param {string} params.name The name of the view associated with these SketchPCBViewSettings. The parameter should be one of four possible values: **breadboard**, **icon**, **pcb**, and **schematic**
 * @param {string} params.backgroundColor The background color of the associated view as a 6 digit hexidecimal value denoted by the pound (#) sign
 * @param {string} params.gridSize The width and height of a square in the associated view's grid
 * @param {boolean} [params.showGrid = true] Whether to show the grid in the associated view
 * @param {boolean} [params.alignToGrid = false] Whether a {@link Sketch} should be aligned to the grid of the associated view
 * @param {viewFromBelow} [params.viewFromBelow = false] Appears to decide whether a {@link Sketch} can be viewed from below. Confirmation of this variable's purpose would be much appreciated
 * @param {string} params.arHoleSize Beyond its association with autorouting, this variable's purpose is unknown
 * @param {string} params.arTraceWidth Beyond its association with autorouting, this variable's purpose is unknown
 * @param {string} params.arRingWidth Beyond its association with autorouting, this variable's purpose is unknown
 * @param {string} params.keepoutDRC Beyond its association with autorouting, this variable's purpose is unknown
 * @param {string} params.keepoutGPG Beyond its association with autorouting, this variable's purpose is unknown
 */
var SketchPCBViewSettings = function (params = {}) {
  SketchViewSettings.call(this, params)
  this.arHoleSize = params.arHoleSize
  this.arTraceWidth = params.arTraceWidth
  this.arRingWidth = params.arRingWidth
  this.keepoutDRC = params.keepoutDRC
  this.keepoutGPG = params.keepoutGPG
}

/**
 * @constructor
 * A Fritzing Sketch. In Fritzing, a Sketch is an abstract collection of Parts arranged together in some fashion in different views. A Sketch can also be considered a project because it contains other metadata like {@link Program}s that go with a specific circuit
 * @param {object} [params = {}] The constructor parameters for this Sketch
 * @param {string} params.fritzingVersion The version of Fritzing used to build this Sketch
 * @param {Program[]} params.programs The {@link Program}s of this Sketch
 * @param {Board[]} params.boards The {@link Board}s of this Sketch
 * @param {SketchViewSettings[]} params.viewSettings The {@link SketchViewSettings} of this Sketch
 * @param {Instance[]} params.instances The {@link Instance}s of this Sketch
 */
var Sketch = function (params = {}) {
  this.fritzingVersion = params.fritzingVersion
  this.programs = params.programs || []
  this.boards = params.boards || []
  this.viewSettings = params.viewSettings || []
  this.instances = params.instances || []
}

/**
 * Returns the program at the given index
 * @param {number} index The index of the program
 * @return {Program} The program at the given index
 */
Sketch.prototype.getProgramAt = function (index) {
  return this.programs[index]
}

/**
 * Adds a program to this Sketch on the condition that it does not already exist
 * @param {Program} program The program to be added
 */
Sketch.prototype.setProgram = function (program) {
  if (!this.hasProgram(program)) this.programs.push(program)
}

/**
 * Returns whether this Sketch has the given program
 * @param {Program} program The given program to search for
 * @return {boolean} Whether this Sketch has the given program
 */
Sketch.prototype.hasProgram = function (program) {
  var has = false
  for (var i = 0; i < this.programs.length; i++) {
    if (this.programs[i] === program) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the given program
 * @param {Program} program The program to be removed
 * @return {boolean} Whether the given program was removed
 */
Sketch.prototype.removeProgram = function (program) {
  var removed = false
  for (var i = 0; i < this.programs.length; i++) {
    if (this.programs[i] === program) {
      this.programs.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the program at the given index
 * @param {number} index The index of the program
 * @return {boolean} Whether the program at the given index was removed
 */
Sketch.prototype.removeProgramAt = function (index) {
  return this.programs.splice(index, 1).length > 0
}

/**
 * Returns the board at the given index
 * @param {number} index The index of the board
 * @return {Board} The board at the given index
 */
Sketch.prototype.getBoardAt = function (index) {
  return this.boards[index]
}

/**
 * Adds a board to this Sketch on the condition that it does not already exist
 * @param {Board} board The board to be added
 */
Sketch.prototype.setBoard = function (board) {
  if (!this.hasBoard(board)) this.boards.push(board)
}

/**
 * Returns whether this Sketch has the given board
 * @param {Board} board The given board to search for
 * @return {boolean} Whether this Sketch has the given board
 */
Sketch.prototype.hasBoard = function (board) {
  var has = false
  for (var i = 0; i < this.boards.length; i++) {
    if (this.boards[i] === board) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the given board
 * @param {Board} board The board to be removed
 * @return {boolean} Whether the given board was removed
 */
Sketch.prototype.removeBoard = function (board) {
  var removed = false
  for (var i = 0; i < this.boards.length; i++) {
    if (this.boards[i] === board) {
      this.boards.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the board at the given index
 * @param {number} index The index of the board
 * @return {boolean} Whether the board at the given index was removed
 */
Sketch.prototype.removeBoardAt = function (index) {
  return this.boards.splice(index, 1).length > 0
}

/**
 * Returns the {@link SketchViewSettings} with the given name
 * @param {string} name The name of the {@link SketchViewSettings}
 * @return {SketchViewSettings} The {@link SketchViewSettings} with the given name
 */
Sketch.prototype.getViewSettings = function (name) {
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
 * Returns the {@link SketchViewSettings} at the given index
 * @param {number} index The index of the {@link SketchViewSettings}
 * @return {SketchViewSettings} The {@link SketchViewSettings} at the given index
 */
Sketch.prototype.getViewSettingsAt = function (index) {
  return this.viewSettings[index]
}

/**
 * Adds a {@link SketchViewSettings} to this Sketch on the condition that another {@link SketchViewSettings} with the same name does not already
exist
 * @param {SketchViewSettings} viewSettings The {@link SketchViewSettings} to be added
 */
Sketch.prototype.setViewSettings = function (viewSettings) {
  if (!this.hasViewSettings(viewSettings.name)) this.viewSettings.push(viewSettings)
}

/**
 * Returns whether this Sketch has a {@link SketchViewSettings} with the given name
 * @param {string} name The given name to search for
 * @return {boolean} Whether this Sketch has a {@link SketchViewSettings} with the given name
 */
Sketch.prototype.hasViewSettings = function (name) {
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
 * Removes the {@link SketchViewSettings} with the given name
 * @param {string} name The name of the {@link SketchViewSettings}
 * @return {boolean} Whether a {@link SketchViewSettings} with the given name was removed
 */
Sketch.prototype.removeViewSettings = function (name) {
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
 * Removes the {@link SketchViewSettings} at the given index
 * @param {number} index The index of the {@link SketchViewSettings}
 * @return {boolean} Whether a {@link SketchViewSettings} at the given index was removed
 */
Sketch.prototype.removeViewSettingsAt = function (index) {
  return this.viewSettings.splice(index, 1).length > 0
}

/**
 * Returns the {@link Instance} with the given model index
 * @param {number} modelIndex The model index of the {@link Instance}
 * @return {Instance} The {@link Instance} with the given model index
 */
Sketch.prototype.getInstance = function (modelIndex) {
  var ret
  for (var i = 0; i < this.instances; i++) {
    if (this.instances[i].modelIndex === modelIndex) {
      ret = this.instances[i]
      break
    }
  }
  return ret
}

/**
 * Returns the {@link Instance} at the given index
 * @param {number} index The index of the {@link Instance}
 * @return {Instance} The {@link Instance} at the given index
 */
Sketch.prototype.getInstanceAt = function (index) {
  return this.instances[index]
}

/**
 * Adds a {@link Instance} to this Sketch on the condition that another {@link Instance} with the same model index does not already exist
 * @param {Instance} instance The {@link Instance} to be added
 */
Sketch.prototype.setInstance = function (instance) {
  if (!this.hasInstance(instance.modelIndex)) this.instances.push(instance)
}

/**
 * Returns whether this Sketch has a {@link Instance} with the given model index
 * @param {number} modelIndex The given model index to search for
 * @return {boolean} Whether this Sketch has a {@link Instance} with the given model index
 */
Sketch.prototype.hasInstance = function (modelIndex) {
  var has = false
  for (var i = 0; i < this.instances.length; i++) {
    if (this.instances[i].modelIndex === modelIndex) {
      has = true
      break
    }
  }
  return has
}

/**
 * Removes the {@link Instance} with the given model index
 * @param {number} modelIndex The model index of the {@link Instance}
 * @return {boolean} Whether a {@link Instance} with the given model index was removed
 */
Sketch.prototype.removeInstance = function (modelIndex) {
  var removed = false
  for (var i = 0; i < this.instances.length; i++) {
    if (this.instances[i].modelIndex === modelIndex) {
      this.instances.splice(i, 1)
      removed = true
      break
    }
  }
  return removed
}

/**
 * Removes the {@link Instance} at the given index
 * @param {number} index The index of the {@link Instance}
 * @return {boolean} Whether a {@link Instance} at the given index was removed
 */
Sketch.prototype.removeInstanceAt = function (index) {
  return this.instances.splice(index, 1).length > 0
}

/**
 * Returns this Sketch as a string of FZ XML
 * @return {Promise} This Sketch as a string of FZ XML
 */
Sketch.prototype.toFZ = function () {
  var i
  var j
  var c
  var d
  var viewSetting
  var viewSettings1
  var moduleView
  var geometry
  var bezier
  var cp0
  var cp1

  function setOptionalValue (obj, key, value) {
    if (value) {
      obj[key] = value
    }
  }

  var module = {
    $: {
      fritzingVersion: this.fritzingVersion
    },
    views: {
      view: []
    },
    instances: {
      instance: []
    }
  }

  if (this.boards.length > 0) {
    module.boards = {
      board: []
    }
    var moduleBoards = module.boards.board
    var boards = this.boards
    for (i = 0; i < boards.length; i++) {
      var board = boards[i]
      moduleBoards.push({
        $: {
          moduleId: board.moduleId,
          title: board.title,
          instance: board.instance,
          width: board.width,
          height: board.height
        }
      })
    }
  }

  if (this.programs.length > 0) {
    module.programs = {
      $: {
        pid: this.programs[0].pid
      },
      program: []
    }
    var modulePrograms = module.programs.program
    var programs = this.programs
    for (i = 0; i < programs.length; i++) {
      var program = programs[i]
      modulePrograms.push({
        $: {
          language: program.language,
          programmer: program.author
        },
        _: program.path
      })
    }
  }

  var moduleViews = module.views.view
  var viewSettings = this.viewSettings
  for (i = 0; i < viewSettings.length; i++) {
    viewSetting = viewSettings[i]
    moduleView = {
      $: {
        name: viewSetting.name + 'View',
        showGrid: (viewSetting.showGrid) ? 1 : 0,
        alignToGrid: (viewSetting.alignToGrid) ? 1 : 0,
        viewFromBelow: (viewSetting.viewFromBelow) ? 1 : 0
      }
    }
    setOptionalValue(moduleView.$, 'backgroundColor', viewSetting.backgroundColor)
    setOptionalValue(moduleView.$, 'gridSize', viewSetting.gridSize)
    if (viewSetting instanceof SketchPCBViewSettings) {
      setOptionalValue(moduleView.$, 'autorouteViaHoleSize', viewSetting.arHoleSize)
      setOptionalValue(moduleView.$, 'autorouteTraceWidth', viewSetting.arTraceWidth)
      setOptionalValue(moduleView.$, 'autorouteViaRingThickness', viewSetting.arRingWidth)
      setOptionalValue(moduleView.$, 'DRC_Keepout', viewSetting.keepoutDRC)
      setOptionalValue(moduleView.$, 'GPG_Keepout', viewSetting.keepoutGPG)
    }
    moduleViews.push(moduleView)
  }

  var moduleInstances = module.instances.instance
  var instances = this.instances
  for (i = 0; i < instances.length; i++) {
    var instance = instances[i]
    var moduleInstance = {
      $: {
        moduleIdRef: instance.moduleIdRef,
        modelIndex: instance.modelIndex,
        path: instance.path,
        flippedSMD: instance.flippedSMD
      },
      views: {}
    }
    setOptionalValue(moduleInstance, 'title', instance.title)
    setOptionalValue(moduleInstance, 'text', instance.text)

    if (instance.properties.length > 0) {
      var properties = instance.properties
      moduleInstance.properties = {
        property: []
      }
      var moduleProperties = moduleInstance.properties.property
      for (j = 0; j < properties.length; j++) {
        var property = properties[j]
        var moduleProperty = {
          $: {
            name: property.name
          }
        }
        setOptionalValue(moduleProperty, 'value', property.value)
        moduleProperties.push(moduleProperty)
      }
    }

    var moduleViews1 = moduleInstance.views
    viewSettings1 = instance.viewSettings
    for (j = 0; j < viewSettings1.length; j++) {
      viewSetting = viewSettings1[j]
      moduleView = {
        $: {
          layer: viewSetting.layer,
          locked: viewSetting.locked,
          bottom: viewSetting.bottom
        }
      }

      if (viewSetting.layerHidden) {
        moduleView.layerHidden = {
          $: {
            layer: viewSetting.layerHidden
          }
        }
      }

      if (viewSetting.titleGeometry) {
        var titleGeometry = viewSetting.titleGeometry
        var moduleTitleGeometry = {
          $: {
            visible: titleGeometry.visible,
            x: titleGeometry.x,
            y: titleGeometry.y,
            z: titleGeometry.z,
            xOffset: titleGeometry.xOffset,
            yOffset: titleGeometry.yOffset,
            textColor: titleGeometry.textColor,
            fontSize: titleGeometry.fontSize
          }
        }
        if (titleGeometry.visibleProperties.length > 0) {
          var visibleProperties = titleGeometry.visibleProperties
          moduleTitleGeometry.displayKey = []
          var moduleDisplayKeys = moduleTitleGeometry.displayKey
          for (c = 0; c < visibleProperties.length; c++) {
            moduleDisplayKeys.push({
              _: visibleProperties[c]
            })
          }
        }
      }

      if (viewSetting.connectors.length > 0) {
        var connectors = viewSetting.connectors
        moduleView.connectors = {
          connector: []
        }
        var moduleConnectors = moduleView.connectors.connector
        for (c = 0; c < connectors.length; c++) {
          var connector = connectors[c]
          geometry = connector.geometry
          var moduleConnector = {
            $: {
              connectorId: connector.id,
              layer: connector.layer
            },
            geometry: {
              $: {
                x: geometry.x,
                y: geometry.y
              }
            },
            connects: {
              connect: []
            }
          }

          if (connector.leg.length > 0) {
            var leg = connector.leg
            moduleConnector.leg = {
              point: [],
              bezier: []
            }
            var moduleLeg = moduleConnector.leg
            var modulePoints = moduleLeg.point
            var moduleBeziers = moduleLeg.bezier
            for (d = 0; d < leg.length; d++) {
              var pair = leg[d]
              var point = pair.point
              bezier = pair.bezier
              modulePoints.push({
                $: {
                  x: point.x,
                  y: point.y
                }
              })
              if (bezier) {
                cp0 = bezier.cp0
                cp1 = bezier.cp1
                moduleBeziers.push({
                  cp0: {
                    $: {
                      x: cp0.x,
                      y: cp0.y
                    }
                  },
                  cp1: {
                    $: {
                      x: cp1.x,
                      y: cp1.y
                    }
                  }
                })
              } else {
                moduleBeziers.push('')
              }
            }
          }

          var moduleConnects = moduleConnector.connects.connect
          var connectsTo = connector.connectsTo
          for (d = 0; d < connectsTo.length; d++) {
            var connectTo = connectsTo[d]
            moduleConnects.push({
              $: {
                connectorId: connectTo.id,
                modelIndex: connectTo.modelIndex,
                layer: connectTo.layer
              }
            })
          }

          moduleConnectors.push(moduleConnector)
        }
      }

      geometry = viewSetting.geometry
      if (viewSetting instanceof WireInstanceViewSettings) {
        moduleView.geometry = {
          $: {
            x: geometry.x,
            y: geometry.y,
            z: geometry.z,
            x1: geometry.x1,
            y1: geometry.y1,
            x2: geometry.x2,
            y2: geometry.y2,
            wireFlags: geometry.wireFlags
          }
        }
        var wireExtras = viewSetting.wireExtras
        moduleView.wireExtras = {
          $: {
            mils: wireExtras.mils,
            color: wireExtras.color,
            opacity: wireExtras.opacity,
            banded: (wireExtras.banded) ? 1 : 0
          }
        }
        if (wireExtras.bezier) {
          bezier = wireExtras.bezier
          cp0 = bezier.cp0
          cp1 = bezier.cp1
          moduleView.wireExtras.bezier = {
            cp0: {
              $: {
                x: cp0.x,
                y: cp0.y
              }
            },
            cp1: {
              $: {
                x: cp1.x,
                y: cp1.y
              }
            }
          }
        }
      } else {
        moduleView.geometry = {
          $: {
            x: geometry.x,
            y: geometry.y,
            z: geometry.z
          }
        }
        if (geometry.transform) {
          var transform = geometry.transform
          moduleView.geometry.transform = {
            $: {
              m11: transform.m11,
              m12: transform.m12,
              m13: transform.m13,
              m21: transform.m21,
              m22: transform.m22,
              m23: transform.m23,
              m31: transform.m31,
              m32: transform.m32,
              m33: transform.m33
            }
          }
        }
      }
      moduleViews1[viewSetting.name + 'View'] = moduleView
    }

    if (instance.localConnectors.length > 0) {
      var localConnectors = instance.localConnectors
      moduleInstance.localConnectors = {
        localConnector: []
      }
      var moduleLocalConnectors = moduleInstance.localConnectors.localConnector
      for (j = 0; j < localConnectors.length; j++) {
        var localConnector = localConnectors[j]
        moduleLocalConnectors.push({
          $: {
            id: localConnector.id,
            name: localConnector.name
          }
        })
      }
    }

    moduleInstances.push(moduleInstance)
  }
  return new xml2js.Builder().buildObject(({
    module: module
  }))
}

/**
 * @static
 * Returns the given Sketch as a string of FZ XML
 * @param {Sketch} sketch The given Sketch
 * @return {Promise} The given Sketch as a string of FZ XML
 */
Sketch.toFZ = function (sketch) {
  return sketch.toFZ()
}

/**
 * @static
 * Returns a Promise that resolves with a {@link Sketch} object converted from the given FZ XML
 * @param {string} fz A string of FZ XML
 * @return {Promise} A Promise that resolves with a {@link Sketch} object converted from the given FZ XML
 */
Sketch.fromFZ = function (fz) {
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
    xml2js.parseString(fz, {
      explicitCharkey: true
    }, function (err, data) {
      var i
      var j
      var c
      var d
      var moduleView
      var moduleGeometry
      var moduleBezier
      var moduleCP0
      var moduleCP1

      if (err) {
        reject(err)
      } else {
        var module = data.module

        var boards = []
        if (module.boards && module.boards[0].board) {
          var moduleBoards = module.boards[0].board
          for (i = 0; i < moduleBoards.length; i++) {
            var moduleBoard = moduleBoards[i]
            boards.push(new Board(
              {
                moduleId: moduleBoard.$.moduleId,
                title: moduleBoard.$.title,
                instance: moduleBoard.$.instance,
                width: moduleBoard.$.width,
                height: moduleBoard.$.height
              }
            ))
          }
        }

        var programs = []
        if (module.programs && module.programs[0].program) {
          var modulePrograms = module.programs[0].program
          var pid = module.programs[0].$.pid
          for (i = 0; i < modulePrograms.length; i++) {
            var moduleProgram = modulePrograms[i]
            programs.push(new Program(
              pid,
              moduleProgram.$.language,
              moduleProgram.$.programmer,
              moduleProgram._
            ))
          }
        }

        var viewSettings = []
        var moduleViews = module.views[0].view
        for (i = 0; i < moduleViews.length; i++) {
          moduleView = moduleViews[i]
          var viewName = moduleView.$.name.slice(0, -4)
          var viewSettingsParams = {
            name: viewName,
            backgroundColor: getOptionalAttribute(moduleView, 'backgroundColor'),
            gridSize: getOptionalAttribute(moduleView, 'gridSize'),
            showGrid: (getOptionalAttribute(moduleView, 'showGrid') === '1'),
            alignToGrid: (getOptionalAttribute(moduleView, 'alignToGrid') === '1'),
            viewFromBelow: (getOptionalAttribute(moduleView, 'viewFromBelow') === '1')
          }

          if (viewName === 'pcb') {
            viewSettingsParams['arHoleSize'] = getOptionalAttribute(moduleView, 'autorouteViaHoleSize')
            viewSettingsParams['arTraceWidth'] = getOptionalAttribute(moduleView, 'autorouteTraceWidth')
            viewSettingsParams['arRingWidth'] = getOptionalAttribute(moduleView, 'autorouteViaRingThickness')
            viewSettingsParams['keepoutDRC'] = getOptionalAttribute(moduleView, 'DRC_Keepout')
            viewSettingsParams['keepoutGPG'] = getOptionalAttribute(moduleView, 'GPG_Keepout')
            viewSettings.push(new SketchPCBViewSettings(viewSettingsParams))
          } else {
            viewSettings.push(new SketchViewSettings(viewSettingsParams))
          }
        }

        var instances = []
        var moduleInstances = module.instances[0].instance
        for (i = 0; i < moduleInstances.length; i++) {
          var moduleInstance = moduleInstances[i]

          var properties = []
          if (moduleInstance.properties && moduleInstance.properties[0].property) {
            var moduleProperties = moduleInstance.properties[0].property
            for (j = 0; j < moduleProperties.length; j++) {
              var moduleProperty = moduleProperties[j]
              properties.push(new Property(
                moduleProperty.$.name,
                moduleProperty.$.value
              ))
            }
          }

          var viewSettings1 = []
          var moduleViewKeys = Object.keys(moduleInstance.views[0])
          for (j = 0; j < moduleViewKeys.length; j++) {
            var titleGeometry
            var moduleViewKey = moduleViewKeys[j]
            moduleView = moduleInstance.views[0][moduleViewKey][0]
            if (moduleView.titleGeometry) {
              var visibleProperties = []
              var moduleTitleGeometry = moduleView.titleGeometry[0]
              if (moduleTitleGeometry.displayKey) {
                var moduleDisplayKeys = moduleTitleGeometry.displayKey
                for (c = 0; c < moduleDisplayKeys.length; c++) {
                  visibleProperties.push(moduleDisplayKeys[c].$.key)
                }
              }
              titleGeometry = new TitleGeometry(
                {
                  x: moduleTitleGeometry.$.x,
                  y: moduleTitleGeometry.$.y,
                  z: moduleTitleGeometry.$.z,
                  visible: (moduleTitleGeometry.$.visible === 'true'),
                  offsetX: moduleTitleGeometry.$.xOffset,
                  offsetY: moduleTitleGeometry.$.yOffset,
                  textColor: moduleTitleGeometry.$.textColor,
                  fontSize: moduleTitleGeometry.$.fontSize,
                  visibleProperties: visibleProperties
                }
              )
            }

            var layerHidden
            if (moduleView.layerHidden) {
              layerHidden = moduleView.layerHidden[0].$.layer
            }

            var connectors = []
            if (moduleView.connectors && moduleView.connectors[0].connector) {
              var moduleConnectors = moduleView.connectors[0].connector
              for (c = 0; c < moduleConnectors.length; c++) {
                var moduleConnector = moduleConnectors[c]

                var leg = []
                if (moduleConnector.leg) {
                  var moduleLeg = moduleConnector.leg[0]
                  for (d = 0; d < moduleLeg.point.length; d++) {
                    var modulePoint = moduleLeg.point[d]
                    if (moduleLeg.bezier[d] !== '') {
                      moduleBezier = moduleLeg.bezier[d]
                      moduleCP0 = moduleBezier.cp0[0]
                      moduleCP1 = moduleBezier.cp1[0]
                      leg.push(new PointBezierPair(
                        new Point(modulePoint.$.x, modulePoint.$.y),
                        new Bezier(
                          new Point(moduleCP0.$.x, moduleCP0.$.y),
                          new Point(moduleCP1.$.x, moduleCP1.$.y)
                        )
                      ))
                    } else {
                      leg.push(new PointBezierPair(
                        new Point(modulePoint.$.x, modulePoint.$.y)
                      ))
                    }
                  }
                }

                var connectsTo = []
                if (moduleConnector.connects && moduleConnector.connects[0].connect) {
                  var moduleConnects = moduleConnector.connects[0].connect
                  for (d = 0; d < moduleConnects.length; d++) {
                    var moduleConnect = moduleConnects[d]
                    connectsTo.push(new InstanceConnectorReference(
                      moduleConnect.$.connectorId,
                      moduleConnect.$.modelIndex,
                      moduleConnect.$.layer
                    ))
                  }
                }

                moduleGeometry = moduleConnector.geometry[0]

                connectors.push(new InstanceConnector(
                  {
                    id: moduleConnector.$.connectorId,
                    layer: moduleConnector.$.layer,
                    geometry: new Geometry(moduleGeometry.$.x, moduleGeometry.$.y),
                    leg: leg,
                    connectsTo: connectsTo
                  }
                ))
              }
            }

            var geometry
            moduleGeometry = moduleView.geometry[0]
            var x = moduleGeometry.$.x
            var y = moduleGeometry.$.y
            var z = moduleGeometry.$.z

            if (moduleView.wireExtras) {
              geometry = new WireGeometry(
                {
                  x: x,
                  y: y,
                  z: z,
                  x1: moduleGeometry.$.x1,
                  y1: moduleGeometry.$.y1,
                  x2: moduleGeometry.$.x2,
                  y2: moduleGeometry.$.y2,
                  wireFlags: moduleGeometry.$.wireFlags
                }
              )

              var moduleWireExtras = moduleView.wireExtras[0]
              var bezier
              if (moduleWireExtras.bezier) {
                moduleBezier = moduleWireExtras.bezier[0]
                moduleCP0 = moduleBezier.cp0[0]
                moduleCP1 = moduleBezier.cp1[0]
                bezier = new Bezier(
                  new Point(moduleCP0.$.x, moduleCP0.$.y),
                  new Point(moduleCP1.$.x, moduleCP1.$.y)
                )
              }

              var wireExtras = new WireExtras(
                {
                  mils: moduleWireExtras.$.mils,
                  color: moduleWireExtras.$.color,
                  opacity: moduleWireExtras.$.opacity,
                  banded: (moduleWireExtras.$.banded === '1'),
                  bezier: bezier
                }
              )

              viewSettings1.push(new WireInstanceViewSettings(
                {
                  name: moduleViewKey.slice(0, -4),
                  layer: moduleView.$.layer,
                  geometry: geometry,
                  titleGeometry: titleGeometry,
                  connectors: connectors,
                  bottom: (moduleView.$.bottom === 'true'),
                  locked: getOptionalAttribute(moduleView, 'locked') === 'true',
                  layerHidden: layerHidden,
                  wireExtras: wireExtras
                }
              ))
            } else {
              var transform
              if (moduleGeometry.transform) {
                var moduleTransform = moduleGeometry.transform[0]
                transform = new Transform(
                  {
                    m11: moduleTransform.$.m11,
                    m12: moduleTransform.$.m12,
                    m13: moduleTransform.$.m13,
                    m21: moduleTransform.$.m21,
                    m22: moduleTransform.$.m22,
                    m23: moduleTransform.$.m23,
                    m31: moduleTransform.$.m31,
                    m32: moduleTransform.$.m32,
                    m33: moduleTransform.$.m33
                  }
                )
              }

              geometry = new TransformGeometry(x, y, z, transform)

              viewSettings1.push(new InstanceViewSettings(
                {
                  name: moduleViewKey.slice(0, -4),
                  layer: moduleView.$.layer,
                  geometry: geometry,
                  titleGeometry: titleGeometry,
                  connectors: connectors,
                  bottom: (moduleView.$.bottom === 'true'),
                  locked: getOptionalAttribute(moduleView, 'locked') === 'true',
                  layerHidden: layerHidden
                }
              ))
            }
          }

          var localConnectors = []
          if (moduleInstance.localConnectors && moduleInstance.localConnectors[0].localConnector) {
            var moduleLocalConnectors = moduleInstance.localConnectors[0].localConnector
            for (j = 0; j < moduleLocalConnectors.length; j++) {
              var moduleLocalConnector = moduleLocalConnectors[j]
              localConnectors.push(new LocalConnector(
                moduleLocalConnector.$.id,
                moduleLocalConnector.$.name
              ))
            }
          }

          instances.push(new Instance(
            {
              moduleIdRef: moduleInstance.$.moduleIdRef,
              modelIndex: moduleInstance.$.modelIndex,
              path: moduleInstance.$.path,
              properties: properties,
              title: getOptionalValue(moduleInstance.title),
              viewSettings: viewSettings1,
              text: getOptionalValue(moduleInstance.text),
              flippedSMD: getOptionalAttribute(moduleInstance, 'flippedSMD') === 'true',
              localConnectors: localConnectors
            }
          ))
        }
        return resolve(new Sketch(
          {
            fritzingVersion: module.$.fritzingVersion,
            programs: programs,
            boards: boards,
            viewSettings: viewSettings,
            instances: instances
          }
        ))
      }
    })
  })
}

module.exports = {
  Bezier: Bezier,
  PointBezierPair: PointBezierPair,
  Geometry: Geometry,
  Transform: Transform,
  TransformGeometry: TransformGeometry,
  WireGeometry: WireGeometry,
  TitleGeometry: TitleGeometry,
  InstanceConnectorReference: InstanceConnectorReference,
  InstanceConnector: InstanceConnector,
  InstanceViewSettings: InstanceViewSettings,
  WireExtras: WireExtras,
  WireInstanceViewSettings: WireInstanceViewSettings,
  LocalConnector: LocalConnector,
  Instance: Instance,
  Program: Program,
  Board: Board,
  SketchViewSettings: SketchViewSettings,
  SketchPCBViewSettings: SketchPCBViewSettings,
  Sketch: Sketch
}
