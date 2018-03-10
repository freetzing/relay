import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Link } from 'react-router-dom'
import './index.css';
import {FZZUtils} from 'fzz-js'
import App from './App';
import Playground from './views/playground';
import Stats from './views/stats';
import RenderBreadboard from './components/renderer/breadboard'
import RenderPCB from './components/renderer/pcb'
import NavBar from './components/navbar'
import ApiClient from 'fritzing-parts-api-client-js'

const FritzingAPI = 'https://fritzing.github.io/fritzing-parts';
const FritzingAPISVGCore = FritzingAPI+'/svg/core/';
const FritzingAPICoreLEDFzp = FritzingAPI+'/core/LED-generic-3mm.fzp';


const apiclient = new ApiClient()

class AppRouter extends Component {
  constructor() {
    super()
    this.state = {
      navbar: null
    }
  }

  componentDidMount() {
    let code  = (
      <NavBar title='fritzing' button='go' input={window.location.search}
      onSearch={ e => {
        console.log('search');
        // FZZUtils.loadFZZ(this.state.url, (err, fzz) => {
        //   if (err) {
        //       alert('could not read fzz')
        //       return
        //   }
        //   console.log('set fzz', fzz);
        //   this.setState({fzz: fzz})
        // })
      }}
      onSearchChange={ e => {
        console.log('change', e.target.value);
        // if (e.target.value.length > 0) {
        //   console.log('==>', e.target.value[0]);
        // }
        // this.setState({url: e.target.value})
      }}
      />
    )
    this.setState({navbar: code})
  }
  render() {
    console.log('NAVBAR', this.state.navbar);
    return (
      <BrowserRouter>
        <div>

          {this.state.navbar}

          <div>
            <Route exact path="/" component={App}/>
            <Route exact path="/fzp" component={fzpIndex}/>
            <Route exact path="/fzp/:id" component={fzpId}/>
            <Route exact path="/stats" component={Stats}/>
            <Route exact path="/playground" component={Playground}/>
            <Route exact path="/renderer/breadboard" component={() => {
              return (
                <RendererB />
              )
            }}/>
          </div>
        </div>
      </BrowserRouter>
    )
  }
}
class fzpId extends Component {
  render() {
    console.log('this.props.match.params.', this.props.match.params);
    let id = this.props.match.params.id
    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-12'>
            id: {id}
          </div>
        </div>
      </div>
    )
  }
}

class fzpIndex extends Component {
  constructor() {
    super()
    this.state = {
      fzps: {}
    }
  }

  componentWillMount() {
    let self = this
    apiclient.getFzps().then(data => {
      // do something with the data
      self.setState({fzps: data})
    }).catch(err => {
      // do something with the error catch
    })
  }

  render() {
    let list = []
    let view
    for (var v in this.state.fzps) {
      if (this.state.fzps.hasOwnProperty(v)) {
        console.log(this.state.fzps[v]);
        list.push(<li><a href={'https://fritzing.github.io/fzp-js-demo-react/build?src='+this.state.fzps[v]}>{v}</a></li>)
      }
    }
    // list = (
    //   <ul>
    //     <li><a href={'https://fritzing.github.io/fzp-js-demo-react/build?src=1'}>1</a></li>
    //     <li><a href={'https://fritzing.github.io/fzp-js-demo-react/build?src=2'}>2</a></li>
    //     <li><a href={'https://fritzing.github.io/fzp-js-demo-react/build?src=3'}>3</a></li>
    //   </ul>
    // )
    console.log('===================', this);
    return (
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-md-3'>
            <ul>{list}</ul>
          </div>
          <div className='col-md-9'>
            {view}
          </div>
        </div>
      </div>
    )
  }
}

class RendererB extends Component {
  constructor() {
    super()
    this.state = {
      src: 'https://fritzing.github.io/fritzing-parts/core/Arduino Nano3(fix).fzp',
      fzz: {fz: {}}
    }
  }

  componentWillMount() {
    let self = this
    console.log('props', this.props);
    const url = 'https://raw.githubusercontent.com/fritzing/creatorkit-code/master/en/Fritzing/Blink.fzz';
    FZZUtils.loadFZZ(url, (err, fzz) => {
      if(err) {
        console.error(err);
        return
      }
      // console.log('OK', fzp);
      self.setState({fzz: fzz})
    })
  }

  render() {
    return (
      <div>
        <RenderPCB fzz={this.state.fzz}/>
      </div>
    )
  }
}



ReactDOM.render(<AppRouter />, document.getElementById('root'));
