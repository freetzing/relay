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

/**
 * @external Promise
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
 */

'use strict'

var { Builder } = require('./lib/builder')

/**
 * A shortcut for {@link Builder#from}
 * @see {@link Builder#from}
 * @returns {Builder} A {@link Builder} with the given **from** configuration
 */
var from = function (format) {
  return new Builder().from(format)
}

/**
 * A shortcut for {@link Builder#type}
 * @see {@link Builder#type}
 * @returns {Builder} A {@link Builder} with the given **type** configuration
 */
var type = function (type) {
  return new Builder().type(type)
}

// /**
//  * A shortcut for {@link Builder#to}
//  * @see {@link Builder#to}
//  * @returns {Builder} A {@link Builder} with the given **to** configuration
//  */
// var to = function (format) {
//   return new Builder().to(format)
// }

/**
 * A shortcut for {@link Builder#data}
 * @see {@link Builder#data}
 * @returns {Builder} A {@link Builder} with the given **data** configuration
 */
var data = function (data) {
  return new Builder().data(data)
}

module.exports = {
  sketch: require('./lib/sketch'),
  part: require('./lib/part'),
  bin: require('./lib/bin'),
  bundle: require('./lib/bundle'),
  global: require('./lib/shared'),
  from: from,
  type: type,
  // to: to,
  data: data
}
