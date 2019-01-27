import React, { Component } from 'react';
import { Button, Header, Grid, Loader } from 'semantic-ui-react'

export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoading: false,
    };
  }

  handleLoginProviderAuth = (evt) => {
    this.setState({ isLoading: true });
    const provider = evt.target.name;
    fetch('/api/oauth/authenticate/' + provider)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoading: false
          });
          if (result.success && result.data && result.data.auth_url ) {
            window.location = result.data.auth_url;
          } else {
            // @TODO: errors
          }

        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error: error
          });
        }
      )
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
          <Loader active={this.state.isLoading}></Loader>
        </Grid>
      </div>
    );
  }
}
