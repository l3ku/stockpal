import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Header, Menu, Grid, Segment, Modal, Dropdown, Image} from 'semantic-ui-react';
import GainerStocks from './components/gainerStocks';
import AllStocks from './components/allStocks';
import UserStocks from './components/userStocks';
import LoginModal from './components/loginModal';
import StockChart from './components/stockChart';
import './dist/main.css';
import API from './utils/api';
import { login, logout } from './actions/authActions';
import { maybeGetUserInfo } from './actions/userActions';
import { fetchStocks, fetchUserStocks } from './actions/stockActions';
import appLogo from './img/graph.png';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: null,
      activeView: 'market-overview',
      activeModal: null,
      activeStock: null,
      previousView: null,
    };

    // Bind custom functions to the class instance
    this.showStock = this.showStock.bind(this);
    this.setPreviousView = this.setPreviousView.bind(this);
  }

  handleSecondaryMenuClick = (e, { name }) => this.setState({ activeView: name });
  handleModalActivation = (e, { name }) => this.setState({ activeModal: name });

  componentWillMount() {
    if ( this.props.isAuthRedirect ) {
      this.props.dispatch(login());
    }

    if ( this.props.isLoggedIn ) {
      this.props.dispatch(maybeGetUserInfo());
      this.props.dispatch(fetchUserStocks());
    }

    this.props.dispatch(fetchStocks());
  }

  setPreviousView() {
    this.setState({ activeSTock: null, activeView: this.state.previousView });
  }

  showStock(evt) {
    let symbol = evt.currentTarget.getAttribute('data-stock-symbol');
    this.setState({ activeStock: symbol, activeView: 'stock-chart', previousView: this.state.activeView });
  }

  render() {
    // Don't render anything if there is a login in progress
    if ( this.props.isAuthRedirect ) {
      return 'Loading...';
    }
    if ( this.props.authError ) {
      return (
        <div>
          <p>Login failed due to an unexpected error: "{this.props.authError}". <a href="/">Click here</a> to return to the home page.</p>
        </div>
      );
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
    } else if ( activeView === 'user-stocks' ) {
      activeComponent = (
        <UserStocks showStockFunc={this.showStock} cookies={this.props.cookies}/>
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
    if ( this.props.isLoggedIn ) {
      const trigger = (
        <div>
          <span className="main-menu-user-name">{this.props.user.name}</span>
          <Image className="main-menu-user-picture" avatar src={this.props.user.picture} />
        </div>
      );
      activeMenu = (
        <Menu.Item>
          <Dropdown trigger={trigger} pointing='top right' icon={null}>
            <Dropdown.Menu>
              <Dropdown.Item>My Account</Dropdown.Item>
              <Dropdown.Item onClick={() => this.props.dispatch(logout())}><span className="main-menu-logout-link">Logout</span></Dropdown.Item>
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
          onClose={() => this.setState({ activeModal: false })}
          size='small'
        >
          <LoginModal />
        </Modal>
        <header>
          <Menu className="main-menu">
            <a href="/">
              <div className='logo-title-container'>
                <div className='logo-container'>
                  <img className='logo' src={appLogo} />
                </div>
                <div className='main-menu-app-title-container'>
                  <Header as='h1' className='main-menu-app-title'>Stockpal</Header>
                </div>
              </div>
            </a>
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
              <Menu.Item name='all-stocks' active={activeView === 'all-stocks'} onClick={this.handleSecondaryMenuClick}>
                All Stocks
              </Menu.Item>
              <Menu.Item disabled={this.props.isLoggedIn === false} name='user-stocks' active={activeView === 'user-stocks'} onClick={this.handleSecondaryMenuClick}>
                My Stocks
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

const mapStateToProps = state => ({
  isAuthRedirect: state.auth.isAuthRedirect,
  apiID: state.auth.apiID,
  apiSecret: state.auth.apiSecret,
  isLoggedIn: state.auth.isLoggedIn,
  authError: state.auth.error,
  user: {
    name: state.user.userName,
    picture: state.user.userPicture
  }
});

export default connect(mapStateToProps)(App);
