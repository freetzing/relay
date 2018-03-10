import React, { Component } from 'react';

class ViewBoards extends Component {
  render() {
    let boardsList = ''
    let code = ''
    if (this.props.fzz.fz) {
      boardsList = this.props.fzz.fz.boards.map((k, v) => {
        return (
          <tr key={v}>
            <td>
              <input value={k.moduleId} onChange={e => { console.log('change...')}} />
              {k.moduleId}</td>
            <td>{k.title}</td>
            <td>{k.instance}</td>
            <td>
              <input value={k.width} onChange={e => { console.log('change width...', e.target.value); }} />
            </td>
            <td>{k.height}</td>
          </tr>
        )
      })
      code = JSON.stringify(this.props.fzz.fz.boards, '', '  ')
    }

    return (
      <div className='row'>

        <div className="col-md-8">
          <b>Table View</b>
          <table className='table'>
            <thead>
              <tr>
                <td>moduleId</td>
                <td>title</td>
                <td>instance</td>
                <td>width</td>
                <td>height</td>
              </tr>
            </thead>
            <tbody>
              {boardsList}
            </tbody>
          </table>
        </div>

        <div className="col-md-4">
          <b>RAW Data</b>
          <pre>{code}</pre>
        </div>

        TODO: redesign to a formular like ui
        TODO: make it editable/set the state of the params

      </div>
    )
  }
}

export default ViewBoards;
