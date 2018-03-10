import React, { Component } from 'react';
import queryString from 'query-string'
const FritzingAPI = 'https://fritzing.github.io/fritzing-parts';
const FritzingAPISVGCore = FritzingAPI+'/svg/core/';
const FritzingAPICoreLEDFzp = FritzingAPI+'/core/LED-generic-3mm.fzp';

class NavBar extends Component {
  constructor(props) {
    let qs = queryString.parse(window.location.search) //.location.search)
    console.log('QS', qs);
    if (qs.src = '') {
      qs.src = FritzingAPICoreLEDFzp
    }
    super(props)
    this.state = {
      qs: qs,
      input: props.input || '',
      container: null,
      containerVisible: 'none',
    }
  }

  componentWillMount() {
    console.log('navbar will mount');
  }

  componentDidMount() {
    console.log('navbar did mount');
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">fritzing</a>

          {/*
          <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              Examples
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a class="dropdown-item" href="#">Action</a>
              <a class="dropdown-item" href="#">Another action</a>
              <a class="dropdown-item" href="#">Something else here</a>
            </div>
          </div>
          */}

            <input className="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search" value={this.state.input}
            onClick={e => {
              console.log('click');
              let newState = ''
              if (this.state.containerVisible === '') {
                newState = 'none'
              }
              this.setState({containerVisible: newState})
            }}
              onKeyPress={e => {console.log(e)}}
              onChange={e => {
                this.setState({input: e.target.value})
                this.props.onSearchChange(e, this.state.input)
              }} />


          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap">
              <a className="nav-link" href="#" onClick={this.props.onSearch}>Load</a>
            </li>
          </ul>

        </nav>
        <div className="navbar-container container" style={{zIndex: 9988, position: 'absolute', width: '80%', height: '80%', marginLeft: '10%', display: this.state.containerVisible}}>
          <div className='row'>
            <div className='col-md-6'>
            ahah
            </div>
            <div className='col-md-6'>
            cool
            </div>
          </div>
        </div>

      </div>
    )
  }
}

export default NavBar;
