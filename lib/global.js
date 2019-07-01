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

/**
 * @constructor
 * @class
 * @classdesc An arbitrary string property
 * @param {string} name The name of this Property
 * @param {string} value The value of this Property
 */
var Property = function (name, value) {
  this.name = name
  this.value = value
}

/**
 * @constructor
 * @class
 * @classdesc A two-dimensional point in virtual space
 * @param {number} x The x-coordinate of this Point
 * @param {number} y The y-coordinate of this Point
 */
var Point = function (x, y) {
  this.x = x
  this.y = y
}

module.exports = {
  Property: Property,
  Point: Point
}

/**
 * @constructor
 * @class
 * @classdesc An instance of a {@link Part}
 * @param {object} [params = {}] The constructor parameters for this Instance
 * @param {string} params.moduleIdRef The module ID of the corresponding {@link Part}
 * @param {string} params.modelIndex The unique index of this Instance
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
