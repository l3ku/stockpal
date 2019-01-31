import React, { Component } from 'react';
import {Header, Menu, Grid, Segment, Modal, Dropdown, Image} from 'semantic-ui-react'
import {GainerStocks} from './components/gainerStocks'
import {LoginModal} from './components/loginModal'
import './dist/main.css';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import API from './utils/api';

class App extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      api_id: cookies.get('_api_id') || null,
      api_secret: cookies.get('_api_secret') || null,
      userPicture: 'https://lh4.googleusercontent.com/-a-Ukxn9wN1U/AAAAAAAAAAI/AAAAAAAAABk/GFcB4D6TZSo/photo.jpg',
      userName: 'Test Name',
      activePage: false,
      activeView: false,
      activeModal: false
    };
  }

  handleSecondaryMenuClick = (e, { name }) => this.setState({ activeView: name })
  handleModalActivation = (e, { name }) => this.setState({ activeModal: name })

  componentWillMount() {
    this.maybeLogin();
  }

  maybeLogin = () => {
    const { cookies } = this.props;
    // Check for the login request
    var pathname = window.location.pathname;
    if ( pathname.includes('/login/') ) {
      var provider = pathname.replace('/login/', '').replace('/', '');
      // Tell the server what data we got from the authentication endpoint.
      // The authentication response to use is the full current URL.
      API.sendLoginAuthResponse(
        provider,
        window.location.href,
        (res) => {
          // Add cookie and redirect to home URL if successful
          if ( res.success ) {
            var cookie_opts = {path: '/', maxAge: 604800};
            cookies.set('_api_id', res.data.api_id, cookie_opts);
            cookies.set('_api_secret', res.data.api_secret, cookie_opts);
            this.setState({api_id: res.data.api_id, api_secret: res.data.api_secret})
            window.location.href = '/';
          } else {
            // TODO: errors
          }
        },
        (err) => {
          console.log(err);
          // TODO: errors
        }
      );
    }
  }

  logout = () => {
    const { cookies } = this.props;
    const { api_id, api_secret } = this.state;
    API.logout(api_id, api_secret,
      (res) => {
        this.setState({api_id: null, api_secret: null});
        cookies.remove('_api_id');
        cookies.remove('_api_secret');
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  render = () => {
    const { activePage, activeView } = this.state;
    let activeComponent = <GainerStocks />;

    // Show the login link as default. However, if the user is already logged in, show the logout link
    // alongside with the "My Account" link.
    let activeMenu = (
      <React.Fragment>
        <Menu.Item name='login' onClick={this.handleModalActivation}>
          Sign In
        </Menu.Item>
      </React.Fragment>
    );
    if ( this.state.api_id && this.state.api_secret ) {
      const trigger = (
        <span>{this.state.userName} <Image avatar src={this.state.userPicture} /></span>
      );
      activeMenu = (
        <Dropdown trigger={trigger} pointing='top right' icon={null}>
          <Dropdown.Menu>
            <Dropdown.Item>My Account</Dropdown.Item>
            <Dropdown.Item onClick={this.logout}>Logout</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    }
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
              {activeMenu}
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

export default withCookies(App);
