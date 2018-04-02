# fritzing-js

### Table of content

- Motivation
- Implementation
- API Draft
- License

### Motivation
...

### Implementation

**The current status of this project is in early stage and not stable**

At the fritzing-js repo you can find a fritzing react app and a module library.
fritzing-js provides the most used function as packages and can be loaded by other projects.

The main Packages:
- IO
  - [FZZ](https://fritzing.github.io/fzz-js/)
  - [FZ](https://github.com/fritzing/fzz-js)
  - [FZP](https://fritzing.github.io/fzp-js/)
  - [SVG](https://github.com/fritzing/fritzing-parts-api-client-js)
- Renderer
  - Breadboard
  - Pcb
  - Schematic
- Apps
  - components


### API Draft
below you can find a first drat of the Fritzing API. How you can program a new fritzing blink. (just an api draft of an upcoming implementation)
```js
// create a new fritzing project
proj = new Fritzing()

// add two parts for this demo
proj.add('arduino')
proj.add('led')

// connect the led to tye arduino board
proj.connector.add().from('arduino', 'gnd').to('led', 'pin0')
proj.connector.add().from('arduino', 'pin7').to('led', 'pin1')

// add code
proj.code('firmware.ino')

// run the project by emulating the code.
proj.run()
```

### License
[MIT License](LICENSE)
