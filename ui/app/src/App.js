import React, { Component } from 'react';
import {Header, Menu, Grid, Segment} from 'semantic-ui-react'
import {MostActiveStocks} from './components/mostActiveStocks'
import {Login} from './components/login'
import './dist/main.css';

class App extends Component {
  state = {}

  handlePrimaryMenuClick = (e, { name }) => this.setState({ activePage: name })
  handleSecondaryMenuClick = (e, { name }) => this.setState({ activeView: name })

  render() {
    const { activePage, activeView } = this.state;
    let activeComponent = <MostActiveStocks />;
    if ( activePage && activePage === 'login' ) {
      activeComponent = (
        <div className='login-wrapper'>
          <Login />
        </div>
      )
    }
    return (
      <div className="stockpal-wrapper">
        <header>
          <Menu primary>
            <a href="/"><Header as='h1'>Stockpal</Header></a>
            <Menu.Menu position='right'>
              <Menu.Item
                name='login'
                active={activePage === 'login'}
                onClick={this.handlePrimaryMenuClick}
              >
                Sign In
              </Menu.Item>
              <Menu.Item name='my-account' active={activePage === 'my-account'} onClick={this.handlePrimaryMenuClick}>
                My Account
              </Menu.Item>
            </Menu.Menu>
          </Menu>
        </header>
        <Grid>
          <Grid.Column width={2} className="item-menu-column">
            <Menu secondary vertical fixed>
              <Menu.Item name='market-overview' active={activeView === 'market-overview'} onClick={this.handleSecondaryMenuClick}>
                Market Overview
              </Menu.Item>
              <Menu.Item name='my-stocks' active={activeView === 'my-stocks'} onClick={this.handleSecondaryMenuClick}>
                My Stocks
              </Menu.Item>
              <Menu.Item name='all-stocks' active={activeView === 'all-stocks'} onClick={this.handleSecondaryMenuClick}>
                All Stocks
              </Menu.Item>
            </Menu>
          </Grid.Column>
          <Grid.Column width={13} className="page-content-column">
            <Segment className='page-content-segment'>
              {activeComponent}
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default App;
