import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Header, Grid, Loader } from 'semantic-ui-react'
import { authenticate } from '../actions/authActions';

class LoginModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
    };
    // Bind custom functions to the class instance
    this.handleLoginProviderAuth = this.handleLoginProviderAuth.bind(this);
  }

  handleLoginProviderAuth(evt) {
    this.setState({ isLoading: true });
    const provider = evt.currentTarget.name;
    this.props.dispatch(authenticate(provider));
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

export default connect()(LoginModal);

