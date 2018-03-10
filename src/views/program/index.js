import React, { Component } from 'react';

class ViewProgram extends Component {
  render() {
    let programsList = ''
    let code = ''
    if (this.props.fzz.fz) {
      // programsList = this.props.fzz.fz.programs.map((k, v) => {
        return (
          <tr key={'v'}>
            // TODO: programs view (table)
            <td>{'k.moduleId'}</td>
            <td>{'k.height'}</td>
          </tr>
        )
      // })
      code = JSON.stringify(this.props.fzz.fz.boards, '', '  ')
    }
    return (
      <div className='row'>
        <div className='class-md-8'>
          <b>Table View</b>
          <table className='table'>
            <thead>
              <tr>
                <td>moduleId</td>
                <td>height</td>
              </tr>
            </thead>
            <tbody>
              {programsList}
            </tbody>
          </table>
        </div>
        <div className='class-md-5'>
          <b>RAW Data</b>
          TODO: make it editable
        </div>
      </div>
    )
  }
}

export default ViewProgram;
