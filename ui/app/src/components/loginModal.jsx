import React, { Component } from 'react';
import { Button, Header, Grid, Loader } from 'semantic-ui-react'
import API from './../utils/api';

export class LoginModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoading: false,
    };
    // Bind custom functions to the class instance
    this.handleLoginProviderAuth = this.handleLoginProviderAuth.bind(this);
  }

  handleLoginProviderAuth(evt) {
    this.setState({ isLoading: true });
    const provider = evt.currentTarget.name;
    API.getLoginAuthLink(provider,
      (result) => {
        this.setState({
          isLoading: false
        });
        if ( result.success ) {
          window.location = result.data.auth_url;
        } else {
          // @TODO: errors
        }
      },
      (error) => {
        this.setState({
          isLoading: false,
          error: error
        });
      });
  }

  render() {
    return (
      <div className='login-section'>
        <Grid centered columns={2}>
          <Grid.Column className='login-column'>
            <Header as='h2'>Login to Stockpal</Header>
            <p>
              Use one of the authorization providers below to login. You will be redirected to the organization sign in page.
            </p>
            <Button id='google-sign-in-button' name='google' onClick={this.handleLoginProviderAuth}></Button>
          </Grid.Column>
          <Loader disabled={!this.state.isLoading}>Loading</Loader>
        </Grid>
      </div>
    );
  }
}
