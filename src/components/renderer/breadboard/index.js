import React, { Component } from 'react';
import {getFilenameFromPath} from '../utils'
const FritzingAPI = 'https://fritzing.github.io/fritzing-parts';
const FritzingAPISVGCore = FritzingAPI+'/svg/core/';

class RenderBreadboard extends Component {
  render() {
    let body
    let svgContent

    if (this.props.fzz.fz) {

      svgContent = this.props.fzz.fz.instances.map((value, i) => {
        // is colon aka core resource
        if (value.path.charAt(0) === ':') {
          console.log('==>', i, value.path);
        } else {
          let name = getFilenameFromPath(value.path)
          // console.log(name);

          // client.getFzp('core/'+name).then(d => {
          //   // console.log('loaded', d);
          //
          // }).catch(e => {
          //    console.error(e);
          //    return
          // })
          // console.log('/////////////////////');
          // console.log(value.moduleIdRef, tmp);
          let tmp
          if (this.props.fzz.fz.fzps[value.moduleIdRef]) {
            tmp = this.props.fzz.fz.fzps[value.moduleIdRef]
            if (this.props.fzz.fz.fzps[value.moduleIdRef].loadSVGs) {
              this.props.fzz.fz.fzps[value.moduleIdRef].loadSVGs(FritzingAPISVGCore)
              .then((d) => {
                console.log('SVG Loaded...') //, this.props.fzz.fz.fzps[value.moduleIdRef].views.breadboard.svg);
              })
              .catch((e) => {
                console.error('ERROR', e);
              })
            }
          }

          console.log('==>', this.props.fzz.fz.fzps[value.moduleIdRef].loadSVGs);
        }

        if (value.views.breadboard.geometry) {
          if (value.views.breadboard.geometry.x && value.views.breadboard.geometry.y) {

            if (value.moduleIdRef === 'WireModuleID') {
              console.log('--> wire');
            }

            // let bbView
            // if (this.props.fzz.fz.fzps[value.moduleIdRef]) {
            //   bbView = this.props.fzz.fz.fzps[value.moduleIdRef].views.breadboard.svg
            // }

            return (
              <g key={i}>
                <rect x={value.views.breadboard.geometry.x+40} y={value.views.breadboard.geometry.y} width='10' height='10' fill='#f00'/>
                <text x={value.views.breadboard.geometry.x+40} y={value.views.breadboard.geometry.y}>{value.moduleIdRef}</text>
              </g>
            )
          }
        }
      })

    body = (
      <div className="row">

        <div className="col-md-12">
          <p>
            <b>Files:</b> <code>{this.props.fzz.files}</code>{" "}
            <b>fritzingVersion:</b> <code>{this.props.fzz.fz.fritzingVersion}</code>
          </p>
        </div>

        <div className="col-md-12">
          {/*
          <p>Boards:</p>
          <pre>{JSON.stringify(this.props.fzz.fz.boards, '', '  ')}</pre>
          <p>Views:</p>
          <pre>{JSON.stringify(this.props.fzz.fz.views, '', '  ')}</pre>
          */}
        </div>

        <div className="col-md-12">
          <svg width='2400' height='1600'>
            <rect x='0' y='0' width='200%' height='100%' fill='#ccc' />
            <g transform="translate(300 330)">
              {svgContent}
            </g>
          </svg>
        </div>

      </div>);
    } else {
      body = <p>Loading...</p>
    }

    return (
      <div>render breadboard {body}</div>
    )
  }
}

export default RenderBreadboard;
