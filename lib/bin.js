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

var { Geometry, InstanceViewSettings, Instance } = require('./global')
var xml2js = require('xml2js')

/**
 * @constructor
 * @class
 * @classdesc A collection of {@link Part}s
 * @param {string} params.fritzingVersion The version of Fritzing used to build this Bin
 * @param {string} params.title The title of this Bin
 * @param {string} params.icon The path of the icon for this Bin
 * @param {Instance[]} [instances = []] An array of simple {@link Instance}s which represent each {@link Part}
 */
var Bin = function (fritzingVersion, title, icon, instances) {
  this.fritzingVersion = fritzingVersion
  this.title = title
  this.icon = icon
  this.instances = instances || []
}

/**
 * Returns this Bin as a string of FZB XML
 * @return {string} This Bin as a string of FZB XML
 */
Bin.prototype.toFZB = function () {
  var module = {
    $: {
      fritzingVersion: this.fritzingVersion,
      icon: this.icon
    },
    title: this.title,
    instances: {
      instance: []
    }
  }

  var moduleInstances = module.instances.instance
  var instances = this.instances
  for (var i = 0; i < instances.length; i++) {
    var instance = instances[i]
    var moduleInstance = {
      $: {
        moduleIdRef: instance.moduleIdRef,
        modelIndex: instance.modelIndex,
        path: instance.path
      },
      views: {}
    }

    var moduleViews = moduleInstance.views
    var viewSettings = instance.viewSettings
    if (viewSettings.length > 0) {
      var iconViewSetting = viewSettings[0]
      var iconGeometry = iconViewSetting.geometry
      moduleViews['iconView'] = {
        $: {
          layer: iconViewSetting.layer
        },
        geometry: {
          $: {
            x: iconGeometry.x,
            y: iconGeometry.y,
            z: iconGeometry.z
          }
        }
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
 * Returns the given Bin as a string of FZB XML
 * @param {Bin} bin The given Bin
 * @return {string} The given Bin as a string of FZB XML
 */
Bin.toFZB = function (bin) {
  return bin.toFZB()
}

/**
 * @static
 * Returns a Promise that resolves with a {@link Bin} object converted from the given FZB XML
 * @param {string} fzb A string of FZB XML
 * @return {Promise} A Promise that resolves with a {@link Bin} object converted from the given FZB XML
 */
Bin.fromFZB = function (fzb) {
  return new Promise(function (resolve, reject) {
    xml2js.parseString(fzb, {
      explicitCharkey: true
    }, function (err, data) {
      if (err) {
        reject(err)
      } else {
        var module = data.module
        var instances = []
        var moduleInstances = module.instances[0].instance
        for (var i = 0; i < moduleInstances.length; i++) {
          var moduleInstance = moduleInstances[i]

          var viewSettings = []
          var moduleViewKeys = Object.keys(moduleInstance.views[0])
          if (moduleViewKeys.length > 0) {
            var moduleIconView = moduleInstance.views[0]['iconView'][0]
            var moduleGeometry = moduleIconView.geometry[0]
            var geometry = new Geometry(moduleGeometry.$.x, moduleGeometry.$.y, moduleGeometry.$.z)
            viewSettings.push(new InstanceViewSettings(
              {
                name: 'icon',
                layer: moduleIconView.$.layer,
                geometry: geometry
              }
            ))
          }
          instances.push(new Instance(
            {
              moduleIdRef: moduleInstance.$.moduleIdRef,
              modelIndex: moduleInstance.$.modelIndex,
              path: moduleInstance.$.path,
              viewSettings: viewSettings
            }
          ))
        }
        return resolve(new Bin(module.$.fritzingVersion, module.title[0]._, module.$.icon, instances))
      }
    })
  })
}

module.exports = {
  Bin: Bin
}
