import React, { Component } from 'react';

class ViewInstances extends Component {
  render() {
    let instancesTable = ''
    if (this.props.fzz.fz) {
      instancesTable = this.props.fzz.fz.instances.map((value, i) => {
        // console.log(i, value);
        return (
          <tr key={i}>
          <td>{i}</td>
          <td>{value.moduleIdRef}</td>
          <td>{value.title}</td>
          <td>{value.path}</td>
          <td>{JSON.stringify(value.views.breadboard.geometry, '', '  ')}</td>
          </tr>
        )
      })
    }

    return (
      <table className="table table-sm">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">moduleIdRef</th>
            <th scope="col">title</th>
            <th scope="col">path</th>
            <th scope="col">breadboard</th>
          </tr>
        </thead>
        <tbody>{instancesTable}</tbody>
      </table>
    )
  }
}

export default ViewInstances;
