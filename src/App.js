import React, { Component } from 'react';
import {FZZUtils} from 'fzz-js';
// import ApiClient from 'fritzing-parts-api-client-js';
import NavBar from './components/navbar'

import ViewBoards from './views/boards'
import ViewCode from './views/code'
import ViewFiles from './views/files'
import ViewInstances from './views/instances'
import ViewProgram from './views/program'
import ViewView from './views/view'

// let client = new ApiClient();

class App extends Component {
  constructor() {
    super()
    this.state ={
      url: 'https://raw.githubusercontent.com/fritzing/creatorkit-code/master/en/Fritzing/Blink.fzz',
      fzz: {}
    }
  }

  componentDidMount() {
    FZZUtils.loadFZZ(this.state.url, (err, fzz) => {

      // console.log(fzz.fz);
      fzz.fz.loadFzps()
      .then((data) => {
        // console.log(data);
        // console.log('author', data[2].author)
        // console.log('date', data[2].date)
        this.setState({fzz: fzz})
      })
      .catch((err) => {
        console.error('Error', err);
      });

    });
  }

  render() {
    let fzpsJson = ''
    if (this.state.fzz.fz) {
      fzpsJson = JSON.stringify(this.state.fzz.fz.fzps, '', '  ')
    }

    // <NavBar title='fritzing' button='go' input={this.state.url}
    //   onSearch={ e => {
    //     FZZUtils.loadFZZ(this.state.url, (err, fzz) => {
    //       if (err) {
    //           alert('could not read fzz')
    //           return
    //       }
    //       console.log('set fzz', fzz);
    //       this.setState({fzz: fzz})
    //     })
    //   }}
    //   onSearchChange={ e => {
    //     console.log('change', e.target.value);
    //     if (e.target.value.length > 0) {
    //       console.log('==>', e.target.value[0]);
    //     }
    //     // this.setState({url: e.target.value})
    //   }}
    // />
    return (
      <div>



        <div className="container-fluid">

          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a className="nav-link active" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false">views</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="instances-tab" data-toggle="tab" href="#instances" role="tab" aria-controls="instances" aria-selected="false">Instances</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="contact-tab" data-toggle="tab" href="#contact" role="tab" aria-controls="contact" aria-selected="false">Programs</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="boards-tab" data-toggle="tab" href="#boards" role="tab" aria-controls="boards" aria-selected="false">Boards ({'this.state.fzz.totalBoards()'})</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true">JSON</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="fzps-tab" data-toggle="tab" href="#fzps" role="tab" aria-controls="fzps" aria-selected="true">FZPS</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="files-tab" data-toggle="tab" href="#files" role="tab" aria-controls="files" aria-selected="true">Files</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" id="code-tab" data-toggle="tab" href="#code" role="tab" aria-controls="code" aria-selected="true">Code</a>
            </li>
          </ul>

          <div className="tab-content" id="myTabContent">
            <div className="tab-pane fade show active" id="profile" role="tabpanel" aria-labelledby="profile-tab">
              <ViewView fzz={this.state.fzz}/>
            </div>
            <div className="tab-pane fade" id="instances" role="tabpanel" aria-labelledby="instances-tab">
              <ViewInstances fzz={this.state.fzz}/>
            </div>
            <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
              <ViewProgram fzz={this.state.fzz}/>
            </div>
            <div className="tab-pane fade" id="boards" role="tabpanel" aria-labelledby="boards-tab">
              <ViewBoards fzz={this.state.fzz}/>
            </div>
            <div className="tab-pane fade" id="home" role="tabpanel" aria-labelledby="home-tab">
              <pre style={{fontSize: '12px'}}>{JSON.stringify(this.state.fzz.fz, '', '  ')}</pre>
            </div>
            <div className="tab-pane fade" id="fzps" role="tabpanel" aria-labelledby="fzps-tab">
              <pre style={{fontSize: '12px'}}>{fzpsJson}</pre>
              ViewFZPS
            </div>
            <div className="tab-pane fade" id="files" role="tabpanel" aria-labelledby="files-tab">
              <ViewFiles fzz={this.state.fzz} />
            </div>
            <div className="tab-pane fade" id="code" role="tabpanel" aria-labelledby="code-tab">
              <ViewCode fzz={this.state.fzz} />
            </div>
          </div>

        </div>

      </div>
    )
  }
}

export default App;
