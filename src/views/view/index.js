import React, { Component } from 'react';
import RenderBreadboard from '../../components/renderer/breadboard'
import RenderPCB from '../../components/renderer/pcb'
import RenderSchematic from '../../components/renderer/schematic'

class ViewView extends Component {
  render() {
    return (
      <div className="row">

        <div className="col-md-6">
          <RenderBreadboard fzz={this.props.fzz}/>
          <RenderPCB fzz={this.props.fzz}/>
          <RenderSchematic fzz={this.props.fzz}/>
        </div>

        <div className="col-md-6">
          {'body'}
        </div>
      </div>
    )
  }
}

export default ViewView;
