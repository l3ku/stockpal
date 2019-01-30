import API from './api';

// TODO: refactor this file neatly away from this declarative logic.
export function authenticate() {
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
        // Redirect to home URL if successful
        if ( res.success ) {
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

function OAuth2Login(provider) {
  const urlParams = new URLSearchParams();


}
