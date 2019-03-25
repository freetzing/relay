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
 * The basic contact information of a Block author or contributor
 * @param {string} name The name of the contact
 * @param {string} email The email of the contact
 */
var Contact = function (name, email) {
  this.name = name
  this.email = email
}

/**
 * A point of connection on a Block
 * @param {object} [params = {}] The constructor parameters for the Connector
 * @param {string} params.connectorId The ID of the Connector
 * @param {string} params.name The name of the Connector
 * @param {string} params.label The short-hand name for the Connector
 * @param {string} params.type The type of the Connector
 * @param {string} params.description The description of the Connector
 * @param {boolean} params.disabled Whether the Connector is disabled
 * @param {ConnectorReference[]} [params.connected = []] An array of {@link ConnectorReference}s to the Connectors connected with this one
 */
var Connector = function (params = {}) {
  this.connectorId = params.connectorId
  this.name = params.name
  this.label = params.label
  this.type = params.type
  this.description = params.description
  // TODO this.ERC = params.ERC
  this.disabled = params.disabled
  this.connected = params.connected || []
}

/**
 * A reference to a {@link Connector}
 * @param {string} blockId The ID of the Block that the {@link Connector} belongs to. If `undefined`, then the {@link Connector} is assumed to belong to the same Block
 * @param {string} connectorId The ID of the {@link Connector}.
 */
var ConnectorReference = function (blockId, connectorId) {
  this.blockId = blockId
  this.connectorId = connectorId
}

/**
 * @constructor
 * @class
 * @classdesc A Freetzing Block
 * @param {object} [params = {}] The constructor parameters for the Block
 * @param {string} params.blockId The ID of the Block
 * @param {string} params.freetzingVersion The version of the Freetzing used to design this Block
 * @param {string} params.name The name of the Block
 * @param {string} params.label The short-hand name for the Block
 * @param {string} params.version The version of the Block, according to Semantic Versioning 2.0
 * @param {string} params.description The description of the Block
 * @param {string} params.stack The Stack that the Block came from
 * @param {Contact} params.author The author of the Block
 * @param {string[]} [params.tags = []] The tags of the Block
 * @param {Property[]} [params.properties = []] The properties of the Block
 * @param {Contact[]} [params.contributors = []] The contributors to the Block
 * @param {Block[]} [params.children = []] The child Blocks that compose the Block
 */
var Block = function (params = {}) {
  this.blockId = params.blockId
  this.freetzingVersion = params.freetzingVersion
  this.name = params.name
  this.label = params.label
  this.version = params.version
  this.description = params.description
  this.stack = params.stack
  this.author = params.author
  this.tags = params.tags || []
  this.properties = params.properties || []
  this.contributors = params.contributors || []
  this.children = params.children || []
}

module.exports = {
  Contact: Contact,
  Connector: Connector,
  ConnectorReference: ConnectorReference,
  Block: Block
}
