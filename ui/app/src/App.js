import React, { Component } from 'react';
import {Header, Menu, Grid, Segment, Modal} from 'semantic-ui-react'
import {GainerStocks} from './components/gainerStocks'
import {LoginModal} from './components/loginModal'
import './dist/main.css';
import {authenticate} from './utils/auth';

class App extends Component {
  constructor(props) {
    authenticate();
    super(props);
    this.state = {
      activePage: false,
      activeView: false,
      activeModal: false
    };
  }

  handleSecondaryMenuClick = (e, { name }) => this.setState({ activeView: name })
  handleModalActivation = (e, { name }) => this.setState({ activeModal: name })

  render() {
    const { activePage, activeView } = this.state;
    let activeComponent = <GainerStocks />;
    return (
      <div className="stockpal-wrapper">
        <Modal
          className='login-modal'
          dimmer='blurring'
          open={this.state.activeModal === 'login'}
          onClose={() => this.setState({activeModal: false})}
          size='small'
        >
          <LoginModal />
        </Modal>
        <header>
          <Menu primary>
            <a href="/"><Header as='h1'>Stockpal</Header></a>
            <Menu.Menu position='right'>
              <Menu.Item
                name='login'
                onClick={this.handleModalActivation}
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
          <Grid.Column width={14} className="page-content-column">
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
