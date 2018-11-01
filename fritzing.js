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
 * @author Paul Vollmer
 */

const xml2js = require('xml2js')
const ADMZip = require('adm-zip')

class Part {
  constructor (options = {}) {
    this.moduleId = options.moduleId
    this.fritzingVersion = options.fritzingVersion
    this.referenceFile = options.referenceFile
    this.author = options.author
    this.version = options.version
    this.replacedBy = options.replacedBy
    this.title = options.title
    this.url = options.url
    this.label = options.label
    this.date = options.date
    this.description = options.description
    this.taxonomy = options.taxonomy
    this.language = options.language
    this.family = options.family
    this.variant = options.variant
    this.defaultUnits = options.defaultUnits
    this.tags = options.tags || []
    this.properties = options.properties || []
    this.viewSettings = options.viewSettings || []
    this.connectors = options.connectors
    this.buses = options.buses || []
    this.subparts = options.subparts || []
  }

  toFZP () {
    function setOptionalValue (obj, key, value) {
      if (value) {
        obj[key] = value
      }
    }

    const module = {
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
      const moduleTags = module.tags.tag
      const tags = this.tags
      for (let i = 0; i < tags.length; i++) {
        moduleTags.push({
          _: tags[i]
        })
      }
    }

    if (this.properties.length > 0) {
      module.properties = {
        property: []
      }
      const moduleProperties = module.properties.property
      const properties = this.properties
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i]
        const moduleProperty = {
          $: {
            name: property.name,
            showInLabel: property.showInLabel
          }
        }
        setOptionalValue(moduleProperty, '_', property.value)
        moduleProperties.push(moduleProperty)
      }
    }

    const moduleViews = module.views
    const viewSettings = this.viewSettings
    for (let i = 0; i < viewSettings.length; i++) {
      const moduleLayersArray = []
      const viewSetting = viewSettings[i]
      const layers = viewSetting.layers
      for (let j = 0; j < layers.length; j++) {
        const layer = layers[j]
        moduleLayersArray.push({
          $: {
            layerId: layer.id,
            sticky: layer.sticky
          }
        })
      }
      const moduleLayers = {
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

    if (this.connectors.connectors.length > 0) {
      module.connectors = {
        $: {
          ignoreTerminalPoints: this.connectors.ignoreTerminalPoints
        },
        connector: []
      }
      const moduleConnectors = module.connectors.connector
      const connectors = this.connectors.connectors
      for (let i = 0; i < connectors.length; i++) {
        const moduleViews1 = {}
        const connector = connectors[i]
        const viewSettings1 = connector.layerSettings
        for (let j = 0; j < viewSettings1.length; j++) {
          const moduleLayers = []
          const viewSetting = viewSettings1[j]
          const layers = viewSetting.layers
          for (let c = 0; c < layers.length; c++) {
            const layer = layers[c]
            const moduleLayer = {
              $: {
                layer: layer.name,
                svgId: layer.svgId,
                hybrid: layer.hybrid
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
        const moduleConnector = {
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
          const erc = connector.erc
          moduleConnector.erc = {
            $: {}
          }
          const moduleERC = moduleConnector.erc
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
            const current = erc.current
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
      const moduleBuses = module.buses.bus
      const buses = this.buses
      for (let i = 0; i < buses.length; i++) {
        const moduleConnectors = []
        const bus = buses[i]
        const connectors = bus.connectors
        for (let j = 0; j < connectors.length; j++) {
          moduleConnectors.push({
            $: {
              connectorId: connectors[j]
            }
          })
        }
        const moduleBus = {
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
      const moduleSubparts = module.subparts.subpart
      const subparts = this.subparts
      for (let i = 0; i < subparts.length; i++) {
        const moduleConnectors = []
        const subpart = subparts[i]
        const connectors = subpart.connectors
        for (let j = 0; j < connectors.length; j++) {
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
}

class PartViewSettings {
  constructor (name, image, layers = [], flipHorizontal = false, flipVertical = false) {
    this.name = name
    this.image = image
    this.layers = layers
    this.flipHorizontal = flipHorizontal
    this.flipVertical = flipVertical
  }
}

class PartLayerSettings {
  constructor (id, sticky = false) {
    this.id = id
    this.sticky = sticky
  }
}

class PartConnector {
  constructor (id, name, type, description, replacedBy, layerSettings = [], erc) {
    this.id = id
    this.name = name
    this.type = type
    this.description = description
    this.replacedBy = replacedBy
    this.layerSettings = layerSettings
    this.erc = erc
  }
}

class ERC {
  constructor (type, voltage, current, ignore) {
    this.type = type
    this.voltage = voltage
    this.current = current
    this.ignore = ignore
  }
}

class Current {
  constructor (flow, valueMax) {
    this.flow = flow
    this.valueMax = valueMax
  }
}

class PartConnectors {
  constructor (connectors = [], ignoreTerminalPoints = false) {
    this.connectors = connectors
    this.ignoreTerminalPoints = ignoreTerminalPoints
  }
}

class ConnectorViewSettings {
  constructor (name, layers = []) {
    this.name = name
    this.layers = layers
  }
}

class ConnectorLayerSettings {
  constructor (name, svgId, terminalId, legId, hybrid = false) {
    this.name = name
    this.svgId = svgId
    this.terminalId = terminalId
    this.legId = legId
    this.hybrid = hybrid
  }
}

class Bus {
  constructor (id, connectors = []) {
    this.id = id
    this.connectors = connectors
  }
}

class Subpart {
  constructor (id, label, connectors = []) {
    this.id = id
    this.label = label
    this.connectors = connectors
  }
}

class Sketch {
  constructor (fritzingVersion, programs = [], boards = [], viewSettings = [], instances = []) {
    this.fritzingVersion = fritzingVersion
    this.programs = programs
    this.boards = boards
    this.viewSettings = viewSettings
    this.instances = instances
  }

  toFZ () {
    function setOptionalValue (obj, key, value) {
      if (value) {
        obj[key] = value
      }
    }

    const module = {
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
      const moduleBoards = module.boards.board
      const boards = this.boards
      for (let i = 0; i < boards.length; i++) {
        const board = boards[i]
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
      const modulePrograms = module.programs.program
      const programs = this.programs
      for (let i = 0; i < programs.length; i++) {
        const program = programs[i]
        modulePrograms.push({
          $: {
            language: program.language,
            programmer: program.author
          },
          _: program.path
        })
      }
    }

    const moduleViews = module.views.view
    const viewSettings = this.viewSettings
    for (let i = 0; i < viewSettings.length; i++) {
      const viewSetting = viewSettings[i]
      const moduleView = {
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

    const moduleInstances = module.instances.instance
    const instances = this.instances
    for (let i = 0; i < instances.length; i++) {
      const instance = instances[i]
      const moduleInstance = {
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
        const properties = instance.properties
        moduleInstance.properties = {
          property: []
        }
        const moduleProperties = moduleInstance.properties.property
        for (let j = 0; j < properties.length; j++) {
          const property = properties[j]
          const moduleProperty = {
            $: {
              name: property.name
            }
          }
          setOptionalValue(moduleProperty, 'value', property.value)
          moduleProperties.push(moduleProperty)
        }
      }

      const moduleViews1 = moduleInstance.views
      const viewSettings1 = instance.viewSettings
      for (let j = 0; j < viewSettings1.length; j++) {
        const viewSetting = viewSettings1[j]
        const moduleView = {
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
          const titleGeometry = viewSetting.titleGeometry
          const moduleTitleGeometry = {
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
            const visibleProperties = titleGeometry.visibleProperties
            moduleTitleGeometry.displayKey = []
            const moduleDisplayKeys = moduleTitleGeometry.displayKey
            for (let c = 0; c < visibleProperties.length; c++) {
              moduleDisplayKeys.push({
                _: visibleProperties[c]
              })
            }
          }
        }

        if (viewSetting.connectors.length > 0) {
          const connectors = viewSetting.connectors
          moduleView.connectors = {
            connector: []
          }
          const moduleConnectors = moduleView.connectors.connector
          for (let c = 0; c < connectors.length; c++) {
            const connector = connectors[c]
            const geometry = connector.geometry
            const moduleConnector = {
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
              const leg = connector.leg
              moduleConnector.leg = {
                point: [],
                bezier: []
              }
              const moduleLeg = moduleConnector.leg
              const modulePoints = moduleLeg.point
              const moduleBeziers = moduleLeg.bezier
              for (let d = 0; d < leg.length; d++) {
                const pair = leg[d]
                const point = pair.point
                const bezier = pair.bezier
                modulePoints.push({
                  $: {
                    x: point.x,
                    y: point.y
                  }
                })
                if (bezier) {
                  const cp0 = bezier.cp0
                  const cp1 = bezier.cp1
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

            const moduleConnects = moduleConnector.connects.connect
            const connectsTo = connector.connectsTo
            for (let d = 0; d < connectsTo.length; d++) {
              const connectTo = connectsTo[d]
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

        const geometry = viewSetting.geometry
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
          const wireExtras = viewSetting.wireExtras
          moduleView.wireExtras = {
            $: {
              mils: wireExtras.mils,
              color: wireExtras.color,
              opacity: wireExtras.opacity,
              banded: (wireExtras.banded) ? 1 : 0
            }
          }
          if (wireExtras.bezier) {
            const bezier = wireExtras.bezier
            const cp0 = bezier.cp0
            const cp1 = bezier.cp1
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
            const transform = geometry.transform
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
        const localConnectors = instance.localConnectors
        moduleInstance.localConnectors = {
          localConnector: []
        }
        const moduleLocalConnectors = moduleInstance.localConnectors.localConnector
        for (let j = 0; j < localConnectors.length; j++) {
          const localConnector = localConnectors[j]
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
}

class SketchViewSettings {
  constructor (options = {}) {
    this.name = options.name
    this.backgroundColor = options.backgroundColor
    this.gridSize = options.gridSize
    this.showGrid = options.showGrid || true
    this.alignToGrid = options.alignToGrid || false
    this.viewFromBelow = options.viewFromBelow || false
  }
}

class SketchPCBViewSettings extends SketchViewSettings {
  constructor (options = {}) {
    super(options)
    this.arHoleSize = options.arHoleSize
    this.arTraceWidth = options.arTraceWidth
    this.arRingWidth = options.arRingWidth
    this.keepoutDRC = options.keepoutDRC
    this.keepoutGPG = options.keepoutGPG
  }
}

class Program {
  constructor (pid, language, author, path) {
    this.pid = pid
    this.language = language
    this.author = author
    this.path = path
  }
}

class Board {
  constructor (moduleId, title, instance, width, height) {
    this.moduleId = moduleId
    this.title = title
    this.instance = instance
    this.width = width
    this.height = height
  }
}

class Instance {
  constructor (moduleIdRef, modelIndex, path, properties = [], title, viewSettings = [], text, flippedSMD = false, localConnectors = []) {
    this.moduleIdRef = moduleIdRef
    this.modelIndex = modelIndex
    this.path = path
    this.properties = properties
    this.title = title
    this.viewSettings = viewSettings
    this.text = text
    this.flippedSMD = flippedSMD
    this.localConnectors = localConnectors
  }
}

class LocalConnector {
  constructor (id, name) {
    this.id = id
    this.name = name
  }
}

class InstanceViewSettings {
  constructor (name, layer, bottom, geometry, titleGeometry, connectors = [], locked = false, layerHidden) {
    this.name = name
    this.layer = layer
    this.bottom = bottom || false
    this.geometry = geometry
    this.titleGeometry = titleGeometry
    this.connectors = connectors
    this.locked = locked
    this.layerHidden = layerHidden
  }
}

class WireInstanceViewSettings extends InstanceViewSettings {
  constructor (name, layer, bottom, wireGeometry, titleGeometry, connectors, locked, layerHidden, wireExtras) {
    super(name, layer, bottom, wireGeometry, titleGeometry, connectors, locked, layerHidden)
    this.wireExtras = wireExtras
  }
}

class InstanceConnector {
  constructor (id, layer, geometry, leg, connectsTo) {
    this.id = id
    this.layer = layer
    this.geometry = geometry
    this.leg = leg || []
    this.connectsTo = connectsTo || []
  }
}

class InstanceConnectorReference {
  constructor (id, modelIndex, layer) {
    this.id = id
    this.modelIndex = modelIndex
    this.layer = layer
  }
}

class Geometry {
  constructor (x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }
}

class TransformGeometry extends Geometry {
  constructor (x, y, z, transform) {
    super(x, y, z)
    this.transform = transform
  }
}

class WireGeometry extends Geometry {
  constructor (x, y, z, x1, y1, x2, y2, wireFlags) {
    super(x, y, z)
    this.x1 = x1
    this.y1 = y1
    this.x2 = x2
    this.y2 = y2
    this.wireFlags = wireFlags
  }
}

class TitleGeometry extends Geometry {
  constructor (x, y, z, visible = true, offsetX, offsetY, textColor, fontSize, visibleProperties = []) {
    super(x, y, z)
    this.visible = visible
    this.offsetX = offsetX
    this.offsetY = offsetY
    this.textColor = textColor
    this.fontSize = fontSize
    this.visibleProperties = visibleProperties
  }
}

class Transform {
  constructor (m11, m12, m13, m21, m22, m23, m31, m32, m33) {
    this.m11 = m11
    this.m12 = m12
    this.m13 = m13
    this.m21 = m21
    this.m22 = m22
    this.m23 = m23
    this.m31 = m31
    this.m32 = m32
    this.m33 = m33
  }
}

class Point {
  constructor (x, y) {
    this.x = x
    this.y = y
  }
}

class Bezier {
  constructor (cp0, cp1) {
    this.cp0 = cp0
    this.cp1 = cp1
  }
}

class PointBezierPair {
  constructor (point, bezier) {
    this.point = point
    this.bezier = bezier
  }
}

class WireExtras {
  constructor (mils, color, opacity, banded = false, bezier) {
    this.mils = mils
    this.color = color
    this.opacity = opacity
    this.banded = banded
    this.bezier = bezier
  }
}

class Property {
  constructor (name, value) {
    this.name = name
    this.value = value
  }
}

class PartProperty extends Property {
  constructor (name, value, showInLabel = false) {
    super(name, value)
    this.showInLabel = showInLabel
  }
}

Sketch.toFZ = (sketch) => {
  return sketch.toFZ()
}

Sketch.fromFZ = (fz) => {
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

  return new Promise((resolve, reject) => {
    xml2js.parseString(fz, {
      explicitCharkey: true
    }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        const module = data.module

        const boards = []
        if (module.boards && module.boards[0].board) {
          const moduleBoards = module.boards[0].board
          for (let i = 0; i < moduleBoards.length; i++) {
            const moduleBoard = moduleBoards[i]
            boards.push(new Board(
              moduleBoard.$.moduleId,
              moduleBoard.$.title,
              moduleBoard.$.instance,
              moduleBoard.$.width,
              moduleBoard.$.height
            ))
          }
        }

        const programs = []
        if (module.programs && module.programs[0].program) {
          const modulePrograms = module.programs[0].program
          const pid = module.programs[0].$.pid
          for (let i = 0; i < modulePrograms.length; i++) {
            const moduleProgram = modulePrograms[i]
            programs.push(new Program(
              pid,
              moduleProgram.$.language,
              moduleProgram.$.programmer,
              moduleProgram._
            ))
          }
        }

        const viewSettings = []
        const moduleViews = module.views[0].view
        for (let i = 0; i < moduleViews.length; i++) {
          const moduleView = moduleViews[i]
          const viewName = moduleView.$.name.slice(0, -4)
          const viewSettingsOptions = {
            name: viewName,
            backgroundColor: getOptionalAttribute(moduleView, 'backgroundColor'),
            gridSize: getOptionalAttribute(moduleView, 'gridSize'),
            showGrid: (getOptionalAttribute(moduleView, 'showGrid') === '1'),
            alignToGrid: (getOptionalAttribute(moduleView, 'alignToGrid') === '1'),
            viewFromBelow: (getOptionalAttribute(moduleView, 'viewFromBelow') === '1')
          }

          if (viewName === 'pcb') {
            viewSettingsOptions['arHoleSize'] = getOptionalAttribute(moduleView, 'autorouteViaHoleSize')
            viewSettingsOptions['arTraceWidth'] = getOptionalAttribute(moduleView, 'autorouteTraceWidth')
            viewSettingsOptions['arRingWidth'] = getOptionalAttribute(moduleView, 'autorouteViaRingThickness')
            viewSettingsOptions['keepoutDRC'] = getOptionalAttribute(moduleView, 'DRC_Keepout')
            viewSettingsOptions['keepoutGPG'] = getOptionalAttribute(moduleView, 'GPG_Keepout')
            viewSettings.push(new SketchPCBViewSettings(viewSettingsOptions))
          } else {
            viewSettings.push(new SketchViewSettings(viewSettingsOptions))
          }
        }

        const instances = []
        const moduleInstances = module.instances[0].instance
        for (let i = 0; i < moduleInstances.length; i++) {
          const moduleInstance = moduleInstances[i]

          const properties = []
          if (moduleInstance.properties && moduleInstance.properties[0].property) {
            const moduleProperties = moduleInstance.properties[0].property
            for (let j = 0; j < moduleProperties.length; j++) {
              const moduleProperty = moduleProperties[j]
              properties.push(new Property(
                moduleProperty.$.name,
                moduleProperty.$.value
              ))
            }
          }

          const viewSettings1 = []
          const moduleViewKeys = Object.keys(moduleInstance.views[0])
          for (let j = 0; j < moduleViewKeys.length; j++) {
            let titleGeometry
            const moduleViewKey = moduleViewKeys[j]
            const moduleView = moduleInstance.views[0][moduleViewKey][0]
            if (moduleView.titleGeometry) {
              const visibleProperties = []
              const moduleTitleGeometry = moduleView.titleGeometry[0]
              if (moduleTitleGeometry.displayKey) {
                const moduleDisplayKeys = moduleTitleGeometry.displayKey
                for (let c = 0; c < moduleDisplayKeys.length; c++) {
                  visibleProperties.push(moduleDisplayKeys[c].$.key)
                }
              }
              titleGeometry = new TitleGeometry(
                (moduleTitleGeometry.$.visible === 'true'),
                moduleTitleGeometry.$.x,
                moduleTitleGeometry.$.y,
                moduleTitleGeometry.$.z,
                moduleTitleGeometry.$.xOffset,
                moduleTitleGeometry.$.yOffset,
                moduleTitleGeometry.$.textColor,
                moduleTitleGeometry.$.fontSize,
                visibleProperties
              )
            }

            let layerHidden
            if (moduleView.layerHidden) {
              layerHidden = moduleView.layerHidden[0].$.layer
            }

            const connectors = []
            if (moduleView.connectors && moduleView.connectors[0].connector) {
              const moduleConnectors = moduleView.connectors[0].connector
              for (let c = 0; c < moduleConnectors.length; c++) {
                const moduleConnector = moduleConnectors[c]

                const leg = []
                if (moduleConnector.leg) {
                  const moduleLeg = moduleConnector.leg[0]
                  for (let d = 0; d < moduleLeg.point.length; d++) {
                    const modulePoint = moduleLeg.point[d]
                    if (moduleLeg.bezier[d] !== '') {
                      const moduleBezier = moduleLeg.bezier[d]
                      const moduleCP0 = moduleBezier.cp0[0]
                      const moduleCP1 = moduleBezier.cp1[0]
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

                const connectsTo = []
                if (moduleConnector.connects && moduleConnector.connects[0].connect) {
                  const moduleConnects = moduleConnector.connects[0].connect
                  for (let d = 0; d < moduleConnects.length; d++) {
                    const moduleConnect = moduleConnects[d]
                    connectsTo.push(new InstanceConnectorReference(
                      moduleConnect.$.connectorId,
                      moduleConnect.$.modelIndex,
                      moduleConnect.$.layer
                    ))
                  }
                }

                const moduleGeometry = moduleConnector.geometry[0]

                connectors.push(new InstanceConnector(
                  moduleConnector.$.connectorId,
                  moduleConnector.$.layer,
                  new Point(
                    moduleGeometry.$.x,
                    moduleGeometry.$.y
                  ),
                  leg,
                  connectsTo
                ))
              }
            }

            let geometry
            const moduleGeometry = moduleView.geometry[0]
            const x = moduleGeometry.$.x
            const y = moduleGeometry.$.y
            const z = moduleGeometry.$.z

            if (moduleView.wireExtras) {
              geometry = new WireGeometry(x, y, z,
                moduleGeometry.$.x1,
                moduleGeometry.$.y1,
                moduleGeometry.$.x2,
                moduleGeometry.$.y2,
                moduleGeometry.$.wireFlags
              )

              const moduleWireExtras = moduleView.wireExtras[0]
              let bezier
              if (moduleWireExtras.bezier) {
                const moduleBezier = moduleWireExtras.bezier[0]
                const moduleCP0 = moduleBezier.cp0[0]
                const moduleCP1 = moduleBezier.cp1[0]
                bezier = new Bezier(
                  new Point(moduleCP0.$.x, moduleCP0.$.y),
                  new Point(moduleCP1.$.x, moduleCP1.$.y)
                )
              }

              const wireExtras = new WireExtras(
                moduleWireExtras.$.mils,
                moduleWireExtras.$.color,
                moduleWireExtras.$.opacity,
                (moduleWireExtras.$.banded === '1'),
                bezier
              )

              viewSettings1.push(new WireInstanceViewSettings(
                moduleViewKey.slice(0, -4),
                moduleView.$.layer,
                (moduleView.$.bottom === 'true'),
                geometry,
                titleGeometry,
                connectors,
                getOptionalAttribute(moduleView, 'locked') === 'true',
                layerHidden,
                wireExtras
              ))
            } else {
              let transform
              if (moduleGeometry.transform) {
                const moduleTransform = moduleGeometry.transform[0]
                transform = new Transform(
                  moduleTransform.$.m11,
                  moduleTransform.$.m12,
                  moduleTransform.$.m13,
                  moduleTransform.$.m21,
                  moduleTransform.$.m22,
                  moduleTransform.$.m23,
                  moduleTransform.$.m31,
                  moduleTransform.$.m32,
                  moduleTransform.$.m33
                )
              }

              geometry = new TransformGeometry(x, y, z, transform)

              viewSettings1.push(new InstanceViewSettings(
                moduleViewKey.slice(0, -4),
                moduleView.$.layer,
                (moduleView.$.bottom === 'true'),
                geometry,
                titleGeometry,
                connectors,
                getOptionalAttribute(moduleView, 'locked') === 'true',
                layerHidden
              ))
            }
          }

          const localConnectors = []
          if (moduleInstance.localConnectors && moduleInstance.localConnectors[0].localConnector) {
            const moduleLocalConnectors = moduleInstance.localConnectors[0].localConnector
            for (let j = 0; j < moduleLocalConnectors.length; j++) {
              const moduleLocalConnector = moduleLocalConnectors[j]
              localConnectors.push(new LocalConnector(
                moduleLocalConnector.$.id,
                moduleLocalConnector.$.name
              ))
            }
          }

          instances.push(new Instance(
            moduleInstance.$.moduleIdRef,
            moduleInstance.$.modelIndex,
            moduleInstance.$.path,
            properties,
            getOptionalValue(moduleInstance.title),
            viewSettings1,
            getOptionalValue(moduleInstance.text),
            getOptionalAttribute(moduleInstance, 'flippedSMD') === 'true',
            localConnectors
          ))
        }
        return resolve(new Sketch(
          module.$.fritzingVersion,
          programs,
          boards,
          viewSettings,
          instances
        ))
      }
    })
  })
}

Part.toFZP = (part) => {
  return part.toFZP()
}

Part.fromFZP = (fzp) => {
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

  return new Promise((resolve, reject) => {
    xml2js.parseString(fzp, {
      explicitCharkey: true
    }, (err, data) => {
      if (err) {
        reject(err)
      } else {
        const module = data.module

        const moduleVersion = getOptionalValue(module.version)
        let moduleReplacedBy
        if (moduleVersion) {
          moduleReplacedBy = getOptionalAttribute(module.version[0], 'replacedby')
        }

        const tags = []
        if (module.tags && module.tags[0].tag) {
          const moduleTags = module.tags[0].tag
          for (let i = 0; i < moduleTags.length; i++) {
            tags.push(moduleTags[i]._)
          }
        }

        const properties = []
        if (module.properties && module.properties[0].property) {
          const moduleProperties = module.properties[0].property
          for (let i = 0; i < moduleProperties.length; i++) {
            const moduleProperty = moduleProperties[i]
            properties.push(new PartProperty(
              moduleProperty.$.name,
              moduleProperty._,
              moduleProperty.$.showInLabel
            ))
          }
        }

        const viewSettings = []
        const moduleViewKeys = Object.keys(module.views[0])
        for (let i = 0; i < moduleViewKeys.length; i++) {
          const moduleViewKey = moduleViewKeys[i]
          if (moduleViewKey.endsWith('View')) {
            const moduleView = module.views[0][moduleViewKey][0]
            const moduleLayers = moduleView.layers[0].layer
            const layers = []
            for (let j = 0; j < moduleLayers.length; j++) {
              const moduleLayer = moduleLayers[j]
              layers.push(new PartLayerSettings(
                moduleLayer.$.layerId,
                getOptionalAttribute(moduleLayer, 'sticky') === 'true'
              ))
            }
            viewSettings.push(new PartViewSettings(
              moduleViewKey.slice(0, -4),
              getOptionalAttribute(moduleView.layers[0], 'image'),
              layers,
              (getOptionalAttribute(moduleView, 'fliphorizontal') === 'true'),
              (getOptionalAttribute(moduleView, 'flipvertical') === 'true')
            ))
          }
        }

        const connectors = []
        let ignoreTerminalPoints = false
        if (module.connectors && module.connectors[0].connector) {
          const moduleConnectors = module.connectors[0].connector
          ignoreTerminalPoints = getOptionalAttribute(module.connectors[0], 'ignoreTerminalPoints') === 'true'
          for (let i = 0; i < moduleConnectors.length; i++) {
            const viewSettings1 = []
            const moduleConnector = moduleConnectors[i]
            const moduleViewKeys1 = Object.keys(moduleConnector.views[0])
            for (let j = 0; j < moduleViewKeys1.length; j++) {
              const layers = []
              const moduleViewKey = moduleViewKeys1[j]
              const moduleView = moduleConnector.views[0][moduleViewKey][0]
              const moduleLayers = moduleView.p
              if (moduleLayers) {
                for (let c = 0; c < moduleLayers.length; c++) {
                  const moduleLayer = moduleLayers[c]
                  layers.push(new ConnectorLayerSettings(
                    moduleLayer.$.layer,
                    moduleLayer.$.svgId,
                    moduleLayer.$.terminalId,
                    moduleLayer.$.legId,
                    moduleLayer.$.hybrid
                  ))
                }
              }
              viewSettings1.push(new ConnectorViewSettings(
                moduleViewKey.slice(0, -4),
                layers
              ))
            }
            let erc
            if (moduleConnector.erc && moduleConnector.erc[0]) {
              const moduleERC = moduleConnector.erc[0]
              let voltage
              if (moduleERC.voltage && moduleERC.voltage[0]) {
                voltage = moduleERC.voltage[0].$.value
              }
              let current
              if (moduleERC.current && moduleERC.current[0]) {
                const moduleCurrent = moduleERC.current[0]
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
              moduleConnector.$.id,
              moduleConnector.$.name,
              moduleConnector.$.type,
              getOptionalValue(moduleConnector.description),
              moduleConnector.$.replacedby,
              viewSettings1,
              erc
            ))
          }
        }

        const buses = []
        if (module.buses && module.buses[0].bus) {
          const moduleBuses = module.buses[0].bus
          for (let i = 0; i < moduleBuses.length; i++) {
            const connectors = []
            const moduleBus = moduleBuses[i]
            const moduleConnectors = moduleBus.nodeMember
            if (moduleConnectors) {
              for (let j = 0; j < moduleConnectors.length; j++) {
                connectors.push(moduleConnectors[j].$.connectorId)
              }
            }
            buses.push(new Bus(
              getOptionalAttribute(moduleBus, 'id'),
              connectors
            ))
          }
        }

        const subparts = []
        if (module['schematic-subparts'] && module['schematic-subparts'][0].subpart) {
          const moduleSubparts = module['schematic-subparts'][0].subpart
          for (let i = 0; i < moduleSubparts.length; i++) {
            const connectors = []
            const moduleSubpart = moduleSubparts[i]
            const moduleConnectors = moduleSubpart.connectors[0].connector
            for (let j = 0; j < moduleConnectors.length; j++) {
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
          tags: tags,
          properties: properties,
          viewSettings: viewSettings,
          connectors: new PartConnectors(
            connectors,
            ignoreTerminalPoints
          ),
          buses: buses,
          subparts: subparts
        }))
      }
    })
  })
}

class PartBin {
  constructor (parts = {}) {
    this.parts = parts
  }

  toFZB () {
    const parts = this.parts
    const partNames = Object.keys(parts)
    const fzb = new ADMZip()
    for (let i = 0; i < partNames.length; i++) {
      const partName = partNames[i]
      fzb.addFile(partName + '.fzp', Buffer.from(parts[partName].toFZP()))
    }
    return fzb.toBuffer()
  }
}

PartBin.fromFZB = (fzb) => {
  return new Promise((resolve, reject) => {
    const unzipped = new ADMZip(fzb)
    const entries = unzipped.getEntries()
    const parts = {}
    const promises = []
    for (let i = 0; i < entries.length; i++) {
      promises.push(new Promise((resolve, reject) => {
        const entry = entries[i]
        const entryName = entry.entryName
        unzipped.readAsTextAsync(entry, (data) => {
          if (data !== '') {
            parts[entryName.split('.')[0]] = Part.fromFZP(data)
            resolve()
          } else {
            reject(new Error('There was an error while reading "' + entryName + '" from the FZB file.'))
          }
        })
      }))
    }
    Promise.all(promises)
      .then(() => {
        resolve(new PartBin(parts))
      })
      .catch((err) => {
        reject(err)
      })
  })
}

class Bundle {
  constructor (primary = {}, auxiliary = {}) {
    this.primary = primary
    this.auxiliary = auxiliary
  }

  toZip (toFile) {
    const primary = this.primary
    const auxiliary = this.auxiliary
    const primaryFiles = Object.keys(primary)
    const auxiliaryFiles = Object.keys(auxiliary)
    const zip = new ADMZip()

    for (let i = 0; i < primaryFiles.length; i++) {
      const primaryFile = primaryFiles[i]
      zip.addFile(primaryFile, Buffer.from(toFile(primary[primaryFile])))
    }

    for (let i = 0; i < auxiliaryFiles.length; i++) {
      const auxiliaryFile = auxiliaryFiles[i]
      zip.addFile(auxiliaryFile, Buffer.from(auxiliary[auxiliaryFile]))
    }

    return zip.toBuffer()
  }
}

Bundle.fromZip = (fromFile, isPrimary, Clazz, zip) => {
  return new Promise((resolve, reject) => {
    const unzipped = new ADMZip(zip)
    const entries = unzipped.getEntries()
    const primary = {}
    const auxiliary = {}
    const promises = []
    for (let i = 0; i < entries.length; i++) {
      promises.push(new Promise((resolve, reject) => {
        const entry = entries[i]
        const entryName = entry.entryName
        if (isPrimary(entryName)) {
          const data = entry.getData()
          if (data.length > 0) {
            fromFile(data)
              .then((primaryObject) => {
                primary[entryName] = primaryObject
                resolve()
              })
              .catch((err) => {
                reject(err)
              })
          } else {
            reject(new Error('There was an error while reading "' + entryName + '" from the bundle file.'))
          }
        } else {
          unzipped.readAsTextAsync(entry, (data) => {
            if (data !== '') {
              auxiliary[entryName] = data
              resolve()
            } else {
              reject(new Error('There was an error while reading "' + entryName + '" from the bundle file.'))
            }
          })
        }
      }))
    }

    Promise.all(promises)
      .then(() => {
        resolve(new Clazz(primary, auxiliary))
      })
      .catch((err) => {
        reject(err)
      })
  })
}

class SketchBundle extends Bundle {
  toFZZ () {
    return this.toZip((sketch) => {
      return sketch.toFZ()
    })
  }
}

SketchBundle.fromFZZ = (fzz) => {
  return Bundle.fromZip(
    (data) => {
      return Sketch.fromFZ(data.toString())
    },
    (entryName) => {
      return entryName.endsWith('.fz')
    }, SketchBundle, fzz)
}

class PartBundle extends Bundle {
  toFZPZ () {
    return this.toZip((part) => {
      return part.toFZP()
    })
  }
}

PartBundle.fromFZPZ = (fzpz) => {
  return Bundle.fromZip(
    (data) => {
      return Part.fromFZP(data.toString())
    },
    (entryName) => {
      return entryName.endsWith('.fzp')
    }, PartBundle, fzpz)
}

class PartBinBundle extends Bundle {
  toFZBZ () {
    return this.toZip((bin) => {
      return bin.toFZB()
    })
  }
}

PartBinBundle.fromFZBZ = (fzbz) => {
  return Bundle.fromZip(
    (data) => {
      return PartBin.fromFZB(data)
    },
    (entryName) => {
      return entryName.endsWith('.fzb')
    }, PartBinBundle, fzbz)
}

module.exports = {
  Part: Part,
  PartViewSettings: PartViewSettings,
  PartConnector: PartConnector,
  ConnectorViewSettings: ConnectorViewSettings,
  LayerSettings: ConnectorLayerSettings,
  Bus: Bus,
  Subpart: Subpart,
  Sketch: Sketch,
  SketchViewSettings: SketchViewSettings,
  SketchPCBViewSettings: SketchPCBViewSettings,
  Program: Program,
  Board: Board,
  Instance: Instance,
  InstanceViewSettings: InstanceViewSettings,
  WireInstanceViewSettings: WireInstanceViewSettings,
  InstanceConnector: InstanceConnector,
  InstanceConnectorReference: InstanceConnectorReference,
  Geometry: Geometry,
  TransformGeometry: TransformGeometry,
  WireGeometry: WireGeometry,
  TitleGeometry: TitleGeometry,
  Transform: Transform,
  Point: Point,
  Bezier: Bezier,
  PointBezierPair: PointBezierPair,
  WireExtras: WireExtras,
  Property: Property,
  PartProperty: PartProperty,
  PartBin: PartBin,
  Bundle: Bundle,
  SketchBundle: SketchBundle,
  PartBundle: PartBundle,
  PartBinBundle: PartBinBundle
}
