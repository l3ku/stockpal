export default class API {
  static getGainerStocks(successCallback, errorCallback) {
    fetch('/api/v1/gainers')
      .then(res => res.json())
      .then((res) => successCallback(res), (err) => errorCallback(err));
  }

  static getStockChart(symbol, successCallback, errorCallback) {
    fetch('/api/v1/stock/' + encodeURIComponent(symbol) + '/chart')
      .then(res => res.json())
      .then((res) => successCallback(res), (err) => errorCallback(err));
  }

  static getStockInfo(symbol, successCallback, errorCallback) {
    let query = '/api/v1/stock';
    if ( symbol ) {
      query += '/' + encodeURIComponent(symbol);
    }
    fetch(query)
      .then(res => res.json())
      .then((res) => successCallback(res), (err) => errorCallback(err));
  }

  static getUserInfo(apiID, apiSecret, successCallback, errorCallback) {
    fetch('/api/protected/userinfo/' + encodeURIComponent(apiID), {
      headers: {'X-API-Key': apiSecret}
      })
      .then(res => res.json())
      .then((res) => successCallback(res), (err) => errorCallback(err));
  }

  static getLoginAuthLink(provider, successCallback, errorCallback) {
    fetch('/api/oauth/authenticate/' + encodeURIComponent(provider))
      .then(res => res.json())
      .then((res) => successCallback(res), (err) => errorCallback(err));
  }

  static sendLoginAuthResponse(provider, authResponse, successCallback, errorCallback) {
    fetch('/api/oauth/login/' + escape(provider), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'authorization_response': authResponse
      })})
      .then(res => res.json())
      .then((res) => successCallback(res), (err) => errorCallback(err));
  }

  static logout(api_id, api_secret, successCallback, errorCallback) {
    fetch('/api/oauth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': api_secret },
      body: JSON.stringify({
        'api_id': api_id
      })})
      .then(res => res.json())
      .then((res) => successCallback(res), (err) => errorCallback(err));
  }
}
