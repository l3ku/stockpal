export default class API {
  static getGainerStocks(success_cb, error_cb) {
    fetch('/api/v1/gainers')
      .then(res => res.json())
      .then((res) => success_cb(res), (err) => error_cb(err));
  }

  static getLoginAuthLink(provider, success_cb, error_cb) {
    fetch('/api/oauth/authenticate/' + escape(provider))
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
}
