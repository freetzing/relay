import React, { Component } from 'react';
import RenderPCB from '../../components/renderer/pcb'
import ViewBoards from '../boards'
const {FZPUtils} = require('fzp-js');
const FritzingAPI = 'https://fritzing.github.io/fritzing-parts';
const FritzingAPISVGCore = FritzingAPI+'/svg/core/';
const FritzingAPICoreLEDFzp = FritzingAPI+'/core/LED-generic-3mm.fzp';

class Playground extends Component {
  constructor() {
    super()
    this.state = {
      fzp: null,
      // fzz: {
      //   fz: {
      //     boards: [
      //       {
      //         moduleId: 'bar',
      //         title: 't1',
      //         instance: 'i1',
      //         width: '100',
      //         height: '200',
      //       },
      //       {
      //         moduleId: 'foo',
      //         title: 't2',
      //         instance: 'i2',
      //         width: '100',
      //         height: '200',
      //       }
      //     ]
      //
      //   }
      // }
    }
  }

  componentDidMount() {
    let self = this
    FZPUtils.loadFZPandSVGs(FritzingAPICoreLEDFzp)
    .then((fzp) => {
      // console.log('OK', fzp);
      self.setState({fzp: fzp})
    })
    .catch((err) => {
      console.error(err);
    })
  }

  render() {
    return (
      <div>
        <code>developer Playground</code>


        <div className='col-md-6'>
          <ViewBoards fzz={this.state.fzz}/>
        </div>

        <div className='col-md-6'>

        </div>

      </div>
    )
  }
}

export default Playground;
