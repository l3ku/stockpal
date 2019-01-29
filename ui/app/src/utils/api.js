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
}
