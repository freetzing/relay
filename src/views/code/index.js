import React, { Component } from 'react';

class ViewCode extends Component {
  render() {
    let code
    if (this.props.fzz.fz) {
      code = JSON.stringify(this.props.fzz.code, '', '  ')
    }
    return (
      <pre style={{fontSize: '12px'}}>
        TODO: arduino code here

        {code}
      </pre>
    )
  }
}

export default ViewCode;
