# Relay

`Relay` is a JavaScript library for the conversion and manipulation of Fritzing data. It supports *all* of the Fritzing file types: Sketches, Parts, Part Bins and Bundles.

## Installation

```sh
yarn add fz-relay
```



## Usage

```javascript
const Relay = require('fz-relay')
const fs = require('fs')


fs.readFile("sketch.fz", (err, fzXML) => {

  if (err) throw err

  Relay.from('fritzing').type('fz').data(fzXML).build()
    .then((sketch) => {

      // work with Sketch data, ie:
      console.log(sketch.fritzingVersion)

    })
    .catch((err) => {
      throw err
    })

})
```

## Documentation

[Click here](https://freetzing.github.io/relay) to go to the library documentation.

## History

Originally, the central task of the Freetzing project and `Relay` was to build a new version of the Fritzing application in JavaScript that would ensure its sustained development by the open source community. The project gained considerable support. [Hackaday even wrote an article about it](https://hackaday.com/2019/04/30/fritzing-is-back-and-this-time-its-written-in-javascript/).

While the article was accurate at the time, much has changed since. Most notably, AISLER (the company behind [Fritzing Fab](https://aisler.net/partners/fritzing)) hired a part-time developer to repair the current Fritzing codebase.

**With these changes in mind**, the Freetzing project has refocused its original goal to support this new wave of development. We are now developing a Parts Editor! As a first step, we developed `Relay` so that anyone could start their own project with Fritzing data and JavaScript. Enjoy!

## Contributing

Want to help? We want you to...too! [Submit a Pull Request](https://github.com/freetzing/relay/compare) or [open a new Issue](https://github.com/freetzing/relay/issues/new). Contributions are absolutely welcome.

## License

`Relay` is originally based upon the [Fritzing](https://github.com/fritzing/fritzing-app) CAD application, and so it shares the [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html) license.
