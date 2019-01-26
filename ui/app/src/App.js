import React, { Component } from 'react';
import {Header, Menu} from 'semantic-ui-react'
import {MostActiveStocks} from './components/mostActiveStocks'
import './App.css';

class App extends Component {
  state = {}

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state
    return (
      <div>
        <header>
          <Menu>
            <Menu.Item
              name='login'
              active={activeItem === 'login'}
              onClick={this.handleItemClick}
            >
              Login
            </Menu.Item>
            <Menu.Item name='my-account' active={activeItem === 'my-account'} onClick={this.handleItemClick}>
              My Account
            </Menu.Item>
          </Menu>
          <Header size='huge'>Stockpal</Header>
        </header>
        <MostActiveStocks />
      </div>
    );
  }
}

export default App;
