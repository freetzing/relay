import React, { Component } from 'react';

class ViewFiles extends Component {
  render() {
    return (
      <div>
        <pre style={{fontSize: '12px'}}>
          {JSON.stringify('this.props.fzz.files', '', '  ')}
        </pre>
        TODO: add file explorer ui and link at click on file to the source editor view
      </div>
    )
  }
}

export default ViewFiles;
