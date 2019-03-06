export default class API {
  static getUserInfo(apiID, apiSecret, successCallback, errorCallback) {
    fetch('/api/protected/userinfo/' + encodeURIComponent(apiID), {
      headers: {'X-API-Key': apiSecret}
      })
      .then(res => res.json())
      .then((res) => successCallback(res), (err) => errorCallback(err));
  }

  static addUserStock(symbol, apiID, apiSecret, successCallback, errorCallback) {
    fetch('/api/protected/stocks/' + encodeURIComponent(apiID), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiSecret
      },
      body: JSON.stringify({
        'stock_symbol': symbol
      })})
      .then(res => res.json())
      .then((res) => successCallback(res), (err) => errorCallback(err));
  }
}
