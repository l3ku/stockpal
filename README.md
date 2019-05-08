# stockpal
An application that displays stock data from the [IEX API](https://iextrading.com/developer/docs/) and allows to perform analysis on the stock charts. This application was originally made for the Programmatic Content Management course at Tampere University of Technology. See it live in action at http://koodi.me.

## Features
- Browse IEX gainer stocks
- Browse all available stocks and search from them
- View stock information, news and chart
- Perform moving average analysis on stocks
- Save stocks to own list

## Running locally
First, create an environment variable file from the sample file `env.sample`:
```
$ cp env.sample .env
$ vim .env
{EDIT FILE}
```
The `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` are not mandatory, but they are required for login services which are done via the Google OAuth2 API. For creating these for your local dev setup, navigate to https://console.developers.google.com/apis/dashboard, and:

- create a new project
- create credentials for that project
- use the client ID and secret from the credentials in the values for `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` values in your `.env` file, respectively
- allow http://localhost/login/google as an authorized redirect URI
- Done!

Full instructions for Google Oauth2 available at https://developers.google.com/identity/protocols/OAuth2.
Navigate to the project root directory and run `make all`.


## Screenshots
All stocks
![](https://raw.githubusercontent.com/l3ku/stockpal/master/screenshots/all_stocks.png)

Searching from all stocks
![](https://github.com/l3ku/stockpal/blob/master/screenshots/stock_search.png)

Gainer stocks
![](https://raw.githubusercontent.com/l3ku/stockpal/master/screenshots/gainers.png)

Own stocks
![](https://raw.githubusercontent.com/l3ku/stockpal/master/screenshots/my_stocks.png)

Stock page
![](https://github.com/l3ku/stockpal/blob/master/screenshots/stock_page.png)

Stock chart
![](https://raw.githubusercontent.com/l3ku/stockpal/master/screenshots/chart.png)

Stock chart with 150 day moving average applied
![](https://raw.githubusercontent.com/l3ku/stockpal/master/screenshots/chart_moving_average.png)
