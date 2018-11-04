![FritzingJS](./logo.png?raw=true "FritzingJS")

![](https://img.shields.io/badge/CODE%20STYLE-STANDARD-d73526.svg?longCache=true&style=flat-square)
![](https://img.shields.io/badge/VERSION-0.0.1-c6af16.svg?longCache=true&style=flat-square)
![](https://img.shields.io/badge/DOCUMENTED-SOON-darkorange.svg?longCache=true&style=flat-square)


This project is a merge of several libraries:
- https://github.com/fritzing/fzp-js
- https://github.com/fritzing/fzz-js
- https://github.com/karpawich/fzp2js

`fritzing-js` unifies the functionality of those libraries into a single API with complete documentation of each Fritzing file format.While present documentation covers the main components of Fritzing files, there were specific components found in various files and the Fritzing source code which have yet to be publicly documented. This library aims to document those components so that they are supported in a Javascript environment.


## API

To convert Fritzing files to JSON and vice versa, use the `to` and `from` functions shown below. **All `from` functions return a Promise, and all `to` functions return synchronously.**

### Conversion Table

|File Extension |API Reference                         |
|---------------|--------------------------------------|
|FZP            |[Part](#fritzing-parts)             |
|FZ             |[Sketch](#fritzing-sketches)        |
|FZB            |[Part Bin](#fritzing-part-bins)   |
|FZZ            |[Sketch Bundle](#fritzing-bundles)  |
|FZPZ           |[Part Bundle](#fritzing-bundles)    |
|FZBZ           |[Part Bin Bundle](#fritzing-bundles)|

### Fritzing Parts
**File extension:** FZP

In Fritzing, a Part is a component of a circuit that can expose connections to other Parts. Examples of Parts include wires, circuit boards, or sensors.

Here's a basic example that converts the contents of an FZP file to a Part object and then converts it back:
```javascript
const { Part } = require('./fritzing')

let fzpContents = ... 

Part.fromFZP(fzpContents)
  .then((part) => {
    // ...

    //convert it back to FZP
    fzpContents = part.toFZP()
  })
  .catch((err) => {
    // handle error
  })
```

### Fritzing Sketches
**File extension:** FZ

In Fritzing, a Sketch is the term for a project that you are working on in the Fritzing application. It is composed of parts, the connections between those parts, and additional auxiliary (secondary) resources like program or SVG files. **However, a FZ file only contains references to those resources. They can be found in either the external file system or within a** ***Sketch Bundle*** **(see below)**

Here's a basic example that converts the contents of an FZ file to a Sketch object and converts it back:
```javascript
const { Sketch } = require('./fritzing')

let fzContents = ... 

Sketch.fromFZ(fzContents)
  .then((sketch) => {
    // ...

    //convert it back to FZ
    fzContents = sketch.toFZ()
  })
  .catch((err) => {
    // handle error
  })
```

### Fritzing Part Bins
**File extension:** FZB

In Fritzing, a Part Bin is a collection of Parts that are put together because of some association between them.

Here's a basic example that converts a buffer containing the contents of an FZB file to a Part Bin object and converts it back:

```javascript
const { PartBin } = require('./fritzing')

let fzbContents = ...  //as a buffer

PartBin.fromFZB(fzbContents)
  .then((fzb) => {
    // ...

    //convert it back to FZB buffer
    fzbContents = fzb.toFZB()
  })
  .catch((err) => {
    // handle error
  })
```

### Fritzing Bundles
**File extensions**:
- **Sketch Bundle** | FZZ
- **Part Bundle** | FZPZ
- **Part Bin Bundle** | FZBZ

In Fritzing, a Bundle is a collection of primaries (Sketches, Parts, Bins) and their auxiliary resources (.svg, .ico, etc.) pooled together.

Here's a basic example that converts the buffer containing the contents of an FZZ file to a Sketch Bundle object and converts it back. The same functions exists for both Part Bundles and Part Bin Bundles, just with their respective file extensions replacing **.fzz** :

```javascript
const { SketchBundle } = require('./fritzing')

let fzzContents = ... //as a buffer

SketchBundle.fromFZZ(fzzContents)
  .then((sketchBundle) => {
    // ...

    //convert back to FZZ ssssbuffer
    fzzContents = sketchBundle.toFZZ()
  })
  .catch((err) => {
    //handle error
  })
```

### Classes

The following classes compose the model of [all primary Fritzing objects](#conversion-table).

```javascript
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
```

Documention will come soon, but in the meantime you can inspect the source code of this library or read more about Fritzing file formats in the [Fritzing Wiki](https://github.com/fritzing/fritzing-app/wiki).

## The Future

- **Helper functions**
- Documentation
- Testing
- Publish to NPM

## License

`fritzing-js` is originally based upon the [Fritzing](https://github.com/fritzing/fritzing-app) CAD application.

### **Thus, the project is also licensed under [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html).**
 You can find a copy of the license in the LICENSE file of this repository.