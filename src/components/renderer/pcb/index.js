import React, { Component } from 'react';
import Snap from 'snapsvg-cjs';

class RenderPCB extends Component {
  constructor() {
    super()
    this.state = {}
  }

  componentDidMount() {
    this.svgRender();
  }
  componentDidUpdate() {
    this.svgRender();
  }

  svgRender() {
    let element = Snap(this.svgDiv)
    let url = 'https://fritzing.github.io/fritzing-parts/svg/core/breadboard/Arduino Nano3_breadboard.svg'
    Snap.load(url, function(data){
      if (element) {
        console.log(data);
        element.append(data);
        console.log(element);
      }
    });
  }

  render() {
    return  <div ref={d=>this.svgDiv=d} />
  }
}

export default RenderPCB;
