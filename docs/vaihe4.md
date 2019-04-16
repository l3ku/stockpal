Leo Toikka
leo.toikka@tuni.fi
https://github.com/l3ku/stockpal
http://koodi.me
# Harjoitustyön vaihe 4
## Toteutetut toiminnallisuudet
Julkaisin sovelluksen oman devausdomainini päähän osoitteeseen http://koodi.me. Sovellus kuitenkin pyörii siellä vielä toistaiseksi ns. dev-moodissa, sillä sovellus ei ole vielä oikeastaan optimoitu tuotantokäyttöä varten esimerkiksi välimuistutusten ja React-buildien osalta.
Edellisessä harjoitustyön vaiheessa toteutin jo osan visualisaatiosta, eli dashboardin yksittäisen osakkeen tietojen näyttämiseen:

![aapl.png](https://www.dropbox.com/s/ucu5i6iea5jcfw0/aapl.png?dl=0&raw=1)



Tässä vaiheessa on tehty sisäänkirjautuneelle käyttäjälle mahdolliseksi laskea dashboard-näkymästä osakkeen kurssidatan liukuvan keskiarvon (moving average) halutulla arvomäärällä ja suurentaa kuvaaja näytölle isompana omassa modaalissaan:

![Screen Shot 2019-04-16 at 13.49.04.png](https://www.dropbox.com/s/irkw2t2sf7x96sx/Screen%20Shot%202019-04-16%20at%2013.49.04.png?dl=0&raw=1)

Käyttäjän on mahdollista valita "Actions" -valikosta erilaisia kuvaajaan kohdistuvia operaatioita, tällä hetkellä valittavissa on osakkeen kurssihistorian aikajakso (esim. yhden päivän tiedot minuuteittain) ja liukuvan keskiarvon laskemiseen käytettävien arvojen lukumäärä (vähintään saatavilla olevan datan määrä):

![Screen Shot 2019-04-16 at 13.52.20.png](https://www.dropbox.com/s/51t1kfm637q2uqw/Screen%20Shot%202019-04-16%20at%2013.52.20.png?dl=0&raw=1)

![Screen Shot 2019-04-16 at 13.52.08.png](https://www.dropbox.com/s/yyl85evg12zg6g1/Screen%20Shot%202019-04-16%20at%2013.52.08.png?dl=0&raw=1)

Mikäli kurssidataa ei ole riittävästi saatavilla liukuvan keskiarvon laskemiseksi, on valinnat himmennetty käyttöliittymästä:

![Screen Shot 2019-04-16 at 13.58.07.png](https://www.dropbox.com/s/inpdywfji51cfye/Screen%20Shot%202019-04-16%20at%2013.58.07.png?dl=0&raw=1)

## Koodiesimerkit
Koska sovelluksen toimintalogiikka on API-pohjaisesti ajateltu ja liukuvan keskiarvon laskeminen voi olla raskas operaatio, on liukuvan keskiarvon laskeminen tehty eräänlaisena API:n "taskina" asynkronisesti Celeryn avulla. Celery suorittaa tehtävän eri Docker-kontissa, eli tarvittaessa olisi mahdollista siirtää raskas laskenta pois samalta koneelta, joka vastaa HTTP-pyyntöihin. Taskit vaativat sovellukseen sisäänkirjautumisen, ja esimerkiksi liukuvan keskiarvon laskupyyntö voidaan tehdä seuraavanlaisesti:
```
$ curl -Lks http://localhost/api/protected/stock/aapl/movingaverage
{
    "success": false,
    "error": {
        "reason": "missing_header",
        "target": "X-API-Key"
    }
}
```
Tässä yllä siis yritettiin pyytää Applen osakedatan liukuvan keskiarvon laskemista, mutta ilman sisäänkirjautumista. Sisäänkirjautumisen kanssa (X-API-Key):
```
$ curl -Lks -H "X-API-Key: GIFQzELcqIiEZd1vzdeFY2N2jgSq26yxOG9lI6PNu2nAq5yw7Mmv2zFkS209S1SO8s5mhzZXCFwOabwvXXLUjskPDluJ19rhe31RDmQH4fQM3exJhl4YkXIkePS5sah5hX0BLUSknMIhgqU9cMU3jd3ivhemyplLd6WL9iexgCHNYHa4WuTc6BrLMJxu3ZthLQdtn4Fz" http://localhost/api/protected/stock/aapl/movingaverage
{
    "success": true,
    "data": {
        "task_id": "5eca7f64-a0c1-44a6-930e-272bf1329f57"
    }
}
```
Tässä API palauttaa taskin tunnisteen, jota voidaan käyttää tuloksen hakemiseksi:
```
$ curl -Lks -H "X-API-Key: GIFQzELcqIiEZd1vzdeFY2N2jgSq26yxOG9lI6PNu2nAq5yw7Mmv2zFkS209S1SO8s5mhzZXCFwOabwvXXLUjskPDluJ19rhe31RDmQH4fQM3exJhl4YkXIkePS5sah5hX0BLUSknMIhgqU9cMU3jd3ivhemyplLd6WL9iexgCHNYHa4WuTc6BrLMJxu3ZthLQdtn4Fz" http://localhost/api/protected/task/5eca7f64-a0c1-44a6-930e-272bf1329f57
{
    "success": true,
    "pending": true
}
```
Yllä API on palauttanut `pending: true`, koska liukuvan keskiarvon laskenta on vielä kesken. Käyttöliittymä toimiikin niin, että se kysyy joka n:s sekunti API:lta, joko tulos olisi jo saatavilla. Odotetaan siis hetki, ja kysytään uudestaan:
```
$ curl -Lks -H "X-API-Key: GIFQzELcqIiEZd1vzdeFY2N2jgSq26yxOG9lI6PNu2nAq5yw7Mmv2zFkS209S1SO8s5mhzZXCFwOabwvXXLUjskPDluJ19rhe31RDmQH4fQM3exJhl4YkXIkePS5sah5hX0BLUSknMIhgqU9cMU3jd3ivhemyplLd6WL9iexgCHNYHa4WuTc6BrLMJxu3ZthLQdtn4Fz" http://localhost/api/protected/task/5eca7f64-a0c1-44a6-930e-272bf1329f57
{
    "success": true,
    "pending": false,
    "result": [
        {
            "date": "2014-04-16",
            "ma": null
        },

        ...

        {
            "date": "2019-04-12",
            "ma": 189.9875515
        },
        {
            "date": "2019-04-15",
            "ma": 190.07321550000003
        }
    ]
}
```
Vastauksen ensimmäiset tulokset ovat nulleja, koska niitä käytetään keskiarvon laskemisessa. Itse tuloksen laskemiseen käytetään yksinkertaisesti Pandas-kirjastoa:
```
@celery.task
def getMovingAverage(data, range):
    df = pd.DataFrame(data)
    ma = df['close'].rolling(window=range, center=False).mean()
    ...
```
Tällä hetkellä sovelluksen toimintalogiikka ei toisaalta ole täysin ongelmaton, sillä siinä ei ole millään tavalla yhdistetty yksittäistä käyttäjää ja hänen tehtäviään, ja mikäli käyttäjä lataa sivun uudelleen tehtävän aikana, sen tulos menetetään (taskin tunnistetta ei tallenneta käyttäjän selaimeen). Lisäksi X-API-Key:n arvo vaihtelee aina kirjautumisen mukaan, eikä se ole kovinkaan järkevää API:n käytön kannalta. Tähän voisi olla ratkaisuna erillinen API-avain tietokantaan ja eri mekanismi käyttöliittymän kautta API:n käyttämiseen.

Käyttöliittymässä hyödynnetään `echarts-for-react`- ja `echarts`-kirjastoja visualisoinnin toteuttamiseen. Alla olevassa koodissa `fetchStockChart`-funktiota käytetään osakkeen hintatietojen kuvaajan hakemiseksi, `getOption`-funktiota `echarts`-kirjaston asetusten välittämiseen ja `render`-funktiota itse komponentin sisällön tulostamiseen näytölle:
```
fetchStockChart = () => {
  fetch('/api/v1/stock/' + encodeURIComponent(this.props.stockSymbol) + '/chart?range=' + encodeURIComponent(this.state.range))
    .then(res => res.json())
    .then(
      (res) => {
        this.setState({
          stockChartData: res.data,
          stockRangeIsLoading: false,
          stockChartIsDisabled: false,
          stockChartIsLoaded: true
        });
      },
      (err) => {
        this.setState({
          error: err,
          stockChartIsLoaded: true,
          stockRangeIsLoading: false
        });
      }
    );
}

...


getOption = () => {
  let seriesData = [];
  let maData = [];
  let xAxisData = [];
  let maIndex = 0;
  for ( let i = 0; i < this.state.stockChartData.length; ++i ) {
    let chartEntry = this.state.stockChartData[i];
    seriesData[i] = chartEntry.close;
    xAxisData[i] = chartEntry.date;
    if ( this.state.stockChartMaData.length > 0 && this.state.stockChartMaData[maIndex]['date'] === chartEntry.date ) {
      maData[maIndex] = this.state.stockChartMaData[i]['ma'];
      ++maIndex;
    }
  };
  let option = {
    title: {
      text: this.state.stockSymbol
    },
    legend: {
      data: ['Price']
    },
    calculable: true,
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
    toolbox: {
      show : true,
      feature : {
        saveAsImage : {
          show: true,
          title: 'Save',
          name: this.state.stockSymbol,
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
        type: 'line',
        name: 'Price'
      }
    ]
  };
  if ( maData.length > 0 ) {
    let name = `Moving average (${this.state.maInterval})`
    option.series.push({
      data: maData,
      type: 'line',
      name: name
    });
    option.legend.data.push(name);
  }
  return option;
}

...

render = () => {
  <Grid className="stock-chart-grid">
    <Grid.Column width={2}>
      <Menu secondary size='small' vertical className="stock-chart-actions-menu">
        <Menu.Item header>Actions</Menu.Item>
        <Dropdown item scrolling text='Date range'>
          <Dropdown.Menu>
            <Dropdown.Header>Range</Dropdown.Header>
            {rangeOptions.map(option => {
              return (
                <Dropdown.Item key={option.name} active={this.state.range === option.name} onClick={(evt) => this.changeRange(evt, option.name)}>{option.name}</Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown item scrolling text='Moving average' disabled={!this.props.apiSecret}>
          <Dropdown.Menu>
            <Dropdown.Header>Interval</Dropdown.Header>
            {movingAverageRangeOptions.map(option => {
              return (
                <Dropdown.Item key={option} active={this.state.maInterval === option} onClick={() => this.setState({maInterval: option, stockChartIsDisabled: true}, this.fetchStockMovingAverage)} disabled={this.state.stockChartData.length <= option}>{option}</Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      </Menu>
    </Grid.Column>
    <Grid.Column width={14}>
      <ReactEcharts showLoading={this.state.stockChartIsDisabled} className="stock-chart-echarts" theme="macarons" option={this.getOption()} style={{height: '100%', width: '100%'}}/>
    </Grid.Column>
  </Grid>
}

...
```
Yllä oleva pätkä sisältää toki vaan osan dashboard-komponentin koodista, mutta Reactin komponenttipohjainen ja niiden sisäistä tilaa käyttävä ohjelmointitapa ilmenee siinä hyvin.

## Hyödylliset linkit
- [Artikkeli](https://ntguardian.wordpress.com/2018/07/17/stock-data-analysis-python-v2/) osaketietojen analysoimiseen Pythonin avulla
- [Celeryn dokumentaatio](https://celery.readthedocs.io/en/latest/) liukuvan keskiarvon taskin luomiseen
- [Echartsin dokumentaatio](https://ecomfe.github.io/echarts-doc/public/en/option.html#title) visualisointimahdollisuuksien kartoittamiseen ja esimerkkien katselemiseen

## Haasteet
- Minulla on vain vähän kokemusta aikasarjadatan analyysista, joten oli vaikeuksia keksiä ja löytää tietoa, mitä toiminnallisuuksia sovellukseen kannattaisi toteuttaa
- Käyttöliittymäkirjaston, kuten Semantic-ui-react:n, käyttö nopeutti huomattavasti itselleni ei niin mielekästä käyttöliittymäkehitystä
- Echarts-kirjasto on miellyttävä käyttää echarts-for-react -kirjaston kautta, sillä siten kuvaajaa voidaan käyttää React-komponenttina









