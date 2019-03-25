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
 * @param {string} connectorId The ID of the Connector
 * @param {string} label The short-hand name for the Connector
 * @param {ConnectorReference[]} [connected = []] An array of {@link ConnectorReference}s to the Connectors connected with this one
 */
var Connector = function (connectorId, label, connected) {
  this.connectorId = connectorId
  this.label = label
  this.connected = connected || []
}

/**
 * A reference to a {@link Connector}
 * @param {string} blockId The ID of the Block that the {@link Connector} belongs to
 * @param {string} connectorId The ID of the {@link Connector}
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
 * @param {string} params.name The name of the Block
 * @param {string} params.label The short-hand name for the Block
 * @param {string} params.version The version of the Block, according to Semantic Versioning 2.0
 * @param {string} params.description The description of the Block
 * @param {string} params.stack The Stack that the Block came from
 * @param {Contact} params.author The author of the Block
 * @param {Contact[]} [params.contributors = []] The contributors to the Block
 * @param {Block[]} [params.children = []] The child Blocks that compose the Block
 */
var Block = function (params = {}) {
  this.blockId = params.blockId
  this.name = params.name
  this.label = params.label
  this.version = params.version
  this.description = params.description
  this.stack = params.stack
  this.author = params.author
  this.contributors = params.contributors || []
  this.children = params.children || []
}

module.exports = {
  Contact: Contact,
  Connector: Connector,
  ConnectorReference: ConnectorReference,
  Block: Block
}
