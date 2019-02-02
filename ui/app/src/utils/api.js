export default class API {
  static getGainerStocks(success_cb, error_cb) {
    fetch('/api/v1/gainers')
      .then(res => res.json())
      .then((res) => success_cb(res), (err) => error_cb(err));
  }

  static getUserInfo(api_id, api_secret, success_cb, error_cb) {
    fetch('/api/oauth/userinfo/' + encodeURIComponent(api_id), {
      headers: {'X-API-Key': api_secret}
      })
      .then(res => res.json())
      .then((res) => success_cb(res), (err) => error_cb(err));
  }

  static getLoginAuthLink(provider, success_cb, error_cb) {
    fetch('/api/oauth/authenticate/' + encodeURIComponent(provider))
      .then(res => res.json())
      .then((res) => success_cb(res), (err) => error_cb(err));
  }

  static sendLoginAuthResponse(provider, auth_response, success_cb, error_cb) {
    fetch('/api/oauth/login/' + escape(provider), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'authorization_response': auth_response
      })})
      .then(res => res.json())
      .then((res) => success_cb(res), (err) => error_cb(err));
  }

  static logout(api_id, api_secret, success_cb, error_cb) {
    fetch('/api/oauth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': api_secret },
      body: JSON.stringify({
        'api_id': api_id
      })})
      .then(res => res.json())
      .then((res) => success_cb(res), (err) => error_cb(err));
  }
}
