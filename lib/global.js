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
 * An arbitrary string property.
 * @param {string} name The name of this Property.
 * @param {string} value The value of this Property.
 */
var Property = function (name, value) {
  this.name = name
  this.value = value
}

/**
 * A two-dimensional point in space.
 * @param {number} x The x-coordinate of this Point.
 * @param {number} y The y-coordinate of this Point.
 */
var Point = function (x, y) {
  this.x = x
  this.y = y
}

module.exports = {
  Property: Property,
  Point: Point
}
