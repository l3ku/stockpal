import API from './api';

// TODO: refactor this file neatly away from this declarative logic.
export function authenticate() {
  // Check for the login request
  if ( window.location.pathname === '/login' ) {
    OAuth2Login();
  }
}

function OAuth2Login() {
  const urlParams = new URLSearchParams(window.location.search);
  const state = urlParams.get('state');
  const code = urlParams.get('code');
  const scope = urlParams.get('scope');
}
