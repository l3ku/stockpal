/* eslint-disable */
import React, { Component } from 'react';
import {Header, Menu, Grid, Segment, Modal, Dropdown, Image} from 'semantic-ui-react';
import {GainerStocks} from './components/gainerStocks';
import AllStocks from './components/allStocks';
import {LoginModal} from './components/loginModal';
import {StockChart} from './components/stockChart';
import './dist/main.css';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import API from './utils/api';
import user_avatar_placeholder from './user-avatar-placeholder.png';

class App extends Component {
  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);
    const { cookies } = props;
    this.state = {
      apiID: cookies.get('_api_id') || null,
      apiSecret: cookies.get('_api_secret') || null,
      isAuthRedirect: window.location.pathname.includes('/login/'),
      userPicture: user_avatar_placeholder,
      userName: 'Loading...',
      activePage: null,
      activeView: null,
      activeModal: null,
      activeStock: null,
      previousView: null,
    };

    // Bind custom functions to the class instance
    this.maybeGetUserInfo = this.maybeGetUserInfo.bind(this);
    this.maybeLogin = this.maybeLogin.bind(this);
    this.logout = this.logout.bind(this);
    this.showStock = this.showStock.bind(this);
    this.setPreviousView = this.setPreviousView.bind(this);
  }

  handleSecondaryMenuClick = (e, { name }) => this.setState({ activeView: name });
  handleModalActivation = (e, { name }) => this.setState({ activeModal: name });

  componentWillMount() {
    this.maybeLogin();
    this.maybeGetUserInfo();
  }

  maybeGetUserInfo() {
    if ( !(this.state.apiID && this.state.apiSecret) ) {
      return;
    }
    API.getUserInfo(this.state.apiID, this.state.apiSecret,
      (res) => {
        if ( res.success ) {
          {this.setState({userName: res.data.user_name, userPicture: res.data.user_picture_url});}
        } else {
          // If the user info fetch fails, it means that the user is no longer
          // logged in validly and should thus relogin. As a concequence, the
          // invalid cookies and state should be cleaned.
          this.setState({apiID: null, apiSecret: null});
          this.props.cookies.remove('_api_id');
          this.props.cookies.remove('_api_secret');
        }
      },
      (err) => {
        console.log(err);
        // TODO: errors
      }
    );
  }

  maybeLogin() {
    // Check for the login request
    if ( this.state.isAuthRedirect ) {
      var login_provider = window.location.pathname.replace('/login/', '').replace('/', '');
      // Tell the server what data we got from the authentication endpoint.
      // The authentication response to use is the full current URL.
      API.sendLoginAuthResponse(
        login_provider,
        window.location.href,
        (res) => {
          // Add cookie and redirect to home URL if successful
          if ( res.success ) {
            var cookie_opts = {path: '/', maxAge: res.data.expires_in};
            this.props.cookies.set('_api_id', res.data.api_id, cookie_opts);
            this.props.cookies.set('_api_secret', res.data.api_secret, cookie_opts);
            window.location.href = '/';
          } else {
            // TODO: errors
            console.log(res);
          }
        },
        (err) => {
          console.log(err);
          // TODO: errors
        }
      );
    }
  }

  logout() {
    API.logout(this.state.apiID, this.state.apiSecret,
      (res) => {
        this.setState({apiID: null, apiSecret: null});
        this.props.cookies.remove('_api_id');
        this.props.cookies.remove('_api_secret');
      },
      (err) => {
        // TODO: errors
        console.log(err);
      }
    );
  }

  setPreviousView() {
    this.setState({activeSTock: null, activeView: this.state.previousView});
  }

  showStock(evt) {
    let symbol = evt.currentTarget.getAttribute('data-stock-symbol');
    this.setState({activeStock: symbol, activeView: 'stock-chart', previousView: this.state.activeView});
  }

  render() {
    // Don't render anything if there is a login in progress
    if ( this.state.isAuthRedirect ) {
      return;
    }

    const activePage = this.state.activePage;
    const activeView = this.state.activeView;
    let activeComponent;
    if ( activeView === 'all-stocks' ) {
      activeComponent = (
        <AllStocks showStockFunc={this.showStock}/>
      );
    } else if ( activeView === 'stock-chart' ) {
      activeComponent = (
        <StockChart stockSymbol={this.state.activeStock} backButtonClickHandler={this.setPreviousView}/>
      );
    } else {
      activeComponent = (
        <GainerStocks showStockFunc={this.showStock}/>
      );
    }

    // Show the login link as default. However, if the user is already logged in, show the logout link
    // alongside with the "My Account" link.
    let activeMenu = (
      <React.Fragment>
        <Menu.Item name='login' onClick={this.handleModalActivation}>
          Sign In
        </Menu.Item>
      </React.Fragment>
    );
    if ( this.state.apiID && this.state.apiSecret ) {
      const trigger = (
        <div>
          <span className="main-menu-user-name">{this.state.userName}</span>
          <Image className="main-menu-user-picture" avatar src={this.state.userPicture} />
        </div>
      );
      activeMenu = (
        <Menu.Item>
          <Dropdown trigger={trigger} pointing='top right' icon={null}>
            <Dropdown.Menu>
              <Dropdown.Item>My Account</Dropdown.Item>
              <Dropdown.Item onClick={this.logout}><span className="main-menu-logout-link">Logout</span></Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
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
          <Menu className="main-menu">
            <a href="/"><Header as='h1' className='main-menu-app-title'>Stockpal</Header></a>
            <Menu.Menu position='right'>
              {activeMenu}
            </Menu.Menu>
          </Menu>
        </header>
        <Grid>
          <Grid.Column width={2} className="item-menu-column">
            <Menu secondary vertical>
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
