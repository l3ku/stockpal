Leo Toikka
leo.toikka@tuni.fi
https://github.com/l3ku/stockpal
# Harjoitustyön vaihe 3
## Toteutetut toiminnallisuudet
Yksittäisen osakkeen tietojen näyttäminen:
- yrityksen tiedot (nimi, kuvaus, toimitusjohtaja jne.)
- osakkeeseen liittyvät uutiset
- osakkeen kurssihistorian näyttäminen kuvaajana EChartsin avulla

Koko yksittäisen osakkeen näkymä näyttää alla olevalta:
![Firefox_Screenshot_2019-03-25T09-56-15.630Z.png](https://www.dropbox.com/s/xtr8ip1h2zjmukt/Firefox_Screenshot_2019-03-25T09-56-15.630Z.png?dl=0&raw=1)
Lisäksi kaikkien osakkeiden listaukselle seuraavat uudet toiminnallisuudet:
- Useiden osakkeiden valitseminen kerralla
- Haku kaikista osakkeista

Koko näkymä näyttää nyt alla olevalta:
![Screen Shot 2019-03-25 at 11.58.16.png](https://www.dropbox.com/s/l9p79reokfi3djk/Screen%20Shot%202019-03-25%20at%2011.58.16.png?dl=0&raw=1)

## Datarajapinnan käyttöönotto
Kokeilemalla eri vaihtoehtoja listauksesta https://rapidapi.com/collection/stock-market-apis päädyin lopullisesti valitsemaan Investors Exchange (IEX) Trading -rajapinnan, sillä se oli ilmainen ja riittävän kattava tarpeisiini (kurssihistoriatiedot 5v taaksepäin). Olin testaillut IEX-rajapinnan käyttöä jo harjoitustyön edellisessä vaiheessa, mutta tässä vaiheessa päätin "lukittautua" pysymään kyseisen rajapinnan käytössä. Toisaalta periaatteessa on myös mahdollista käyttää useita rajapintoja osakkeiden symbolien avulla (esim. Applella "AAPL").

IEX:n rajapintaa käytetään sovelluksessa aina backendin kautta. Tämä mahdollistaa kätevästi esimerkiksi datan muokkauksen tarvittaessa ennen frontendille lähetystä, vaikkapa yhdistelemällä tietoja eri lähteistä tai poistamalla tarpeettomia attribuutteja datasta. HTTP-pyyntöjen tekemiseksi käytettiin Pythonin näppärää requests-kirjastoa, jonka asentaminen tapahtui asettamalla backendin `requirements.txt`-tiedostoon rivit
```
# For accessing external APIs
requests==2.21.0
```
ja rebuildaamalla Docker-kontti, jotta sovelluksen toimintaympäristö luodaan uudelleen siten, että requests-kirjasto on saatavilla. Esimerkiksi Flask-restful resurssin määrittely osakkeen yritystietojen hakemiseksi:
```
class StockCompany(Resource):
    def get(self, symbol):
        symbol_esc = quote(symbol, safe='')
        is_stock_known = Stock.query.filter_by(symbol=symbol_esc)
        if is_stock_known is None:
            return {'success': False, 'error': f'Unknown stock symbol: {symbol_esc}'}
        else:
            response = requests.get(f'{iex_api_url}/stock/{symbol}/company')
            return {'success': True, 'data': response.json()}
```
Sovelluslogiikka siis tarkastaa, että osakesymboli on tunnettu ennen HTTP-pyynnön tekemistä, ja sen jälkeen yksinkertaisesti vain palauttaa IEX-API:n osoitteeseen https://api.iextrading.com/1.0/stock/{symbol}/company tehdyn pyynnön vastauksen kutsumalla `requests`-kirjaston `get`-funktiota. Sovellus päivittää tietokantaansa tuetut osakesymbolit tunneittain IEX:n [ref-data](https://iextrading.com/developer/docs/#reference-data)-endpointista, jotta osakkeita on mahdollista listata käyttäjälle. Toisena esimerkkinä osakkeiden kurssihistorian hakeminen:
```
class StockChart(Resource):
    def get(self, symbol):
        symbol_esc = quote(symbol, safe='')
        is_stock_known = Stock.query.filter_by(symbol=symbol_esc)
        if is_stock_known is None:
            return {'success': False, 'error': f'Unknown stock symbol: {symbol_esc}'}
        else:
            parser = reqparse.RequestParser()
            parser.add_argument('range')
            args = parser.parse_args()
            interval = quote(args['range']) if args['range'] else '5y'
            response = requests.get(iex_api_url + f'/stock/{symbol_esc}/chart/{interval}')
            return {'success': True, 'data': response.json()}
```
RequestParser-oliota käytetään hakemaan käyttäjän haluama historian pituus, joka on kuitenkin oletuksena 5 vuotta.
Lopuksi vielä täytyy muistaa tehdä reititys kyseisille resursseille, jotta niihin pääsee URL:lla käsiksi:
```
api.add_resource(StockChart, v1_base_url + '/stock/<string:symbol>/chart')
api.add_resource(StockCompany, v1_base_url + '/stock/<string:symbol>/company')
```
Kuten edellisistä koodeista voidaan havaita, sovellus ei tallenna omaan tietokantaansa yksittäisen osakkeiden "tarkkoja" tietoja, kuten yritystietoja, logoa, ja kurssihistoriaa, eli pelkästään [ref-data](https://iextrading.com/developer/docs/#reference-data)-endpointin tietoja käytetään osakelistauksen muodostamiseen, ja siten osakelistauksen symbolien avulla haetaan nämä "tarkemmat" tiedot IEX:n rajapinnasta. Kyseinen toimintalogiikka perustuu ideaan, että ei välttämättä ole järkevää tallentaa sovelluksen tietokantaan n. 9000 eri osakkeen yksityiskohtaisia tietoja yksi kerrallaan käyttäjän kysyessä niitä. Mikäli sovelluksen suorituskyky huolestuttaa toistuvien ulkoisten API-pyyntöjen suhteen, niin esimerkiksi UI:n ja Backendin välissä olevan Nginx-palvelimen HTTP-välimuistin käyttönotto voisi parantaa suorituskykyä huomattavasti, kun toistuvat API-pyynnöt palautettaisiin välimuistista sen sijaan, että pyyntö päätyisi backendille tai saati IEX:lle asti.
Sovelluksen käyttöliittymän puolella osakkeen kurssihistoria näytetään react-echarts -kirjastoa hyödyntämällä, alla ote React-komponentista:
```
  getOption = () => {
    const seriesData = [];
    const xAxisData = [];
    for ( let i = 0; i < this.state.stockChartData.length; ++i ) {
      let chartEntry = this.state.stockChartData[i];
      seriesData[i] = chartEntry.low;
      xAxisData[i] = chartEntry.date;
    };
    return {
      title: {
        text: this.state.stockSymbol
      },
      calculable: true,
      legend: {
        data: ['High', 'Date'],
        x: 'left'
      },
      dataZoom: [
        {
          show: true,
          realtime: true,
          start: 65,
          end: 85
        },
        {
          type: 'inside',
          realtime: true,
          start: 65,
          end: 85
        }
      ],
      grid: {
        bottom: 80
      },
      tooltip : {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          animation: false,
          label: {
            backgroundColor: '#505765'
          }
        }
      },
      xAxis: [
        {
          name: 'Date',
          type : 'category',
          boundaryGap : false,
          axisLine: {onZero: false},
          data: xAxisData
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: '{value} $'
          }
        }
      ],
      series: [
        {
          data: seriesData,
          type: 'line'
        }
      ]
    };
  }

  render() {
    ...
    <ReactEcharts className={eChartsClass} option={this.getOption()}/>
    ...
  }
```
## Kohdatut haasteet
-  API:n etsiminen ja valitsiminen oli haastavaa, koska useissa vaihtoehdoissa ei ollut saatavilla riittävän kattavaa kurssihistoriadataa.
- CSS:n tehokas käyttö on minusta aina ollut vaikeaa, ja siksi olenkin käyttänyt `semantic-ui-react`-käyttöliittymäkirjastoa sovelluksen tekemiseen. Kuitenkin aina välillä tulee tilanne, jossa kirjaston tarjoama ulkoasu ei miellytä, vaan joutuu tekemään omia CSS-määrittelyjä.
- EChartsin konfiguroimislogiikka oli aluksi haastavaa opetella (getOption-funktio aiemmin)

## Hyödylliset linkit
- IEX:n API-dokumentaatio: https://iextrading.com/developer/docs/
- Echarts for Reactin dokumentaatio: https://github.com/hustcc/echarts-for-react
- Echartsin dokumentaatio: https://echarts.apache.org/option.html





