Leo Toikka
leo.toikka@tuni.fi
https://github.com/l3ku/stockpal
http://koodi.me
# Harjoitustyön vaihe 4
## Toteutetut toiminnallisuudet
Julkaisin sovelluksen oman devausdomainini päähän osoitteeseen http://koodi.me. Sovellus kuitenkin pyörii siellä vielä toistaiseksi ns. dev-moodissa, sillä sovellus ei ole vielä oikeastaan optimoitu tuotantokäyttöä varten esimerkiksi välimuistutusten ja React-buildien osalta.
Edellisessä harjoitustyön vaiheessa toteutin jo osan visualisaatiosta, eli dashboardin yksittäisen osakkeen tietojen näyttämiseen:
![aapl.png](https://www.dropbox.com/s/ucu5i6iea5jcfw0/aapl.png?dl=0&raw=1)



Tässä vaiheessa on tehty sisäänkirjautuneelle käyttäjälle mahdolliseksi laskea dashboard-näkymästä osakkeen kurssidatan liukuvan keskiarvon (moving average) halutulla arvomäärällä ja suurentaa kuvaaja näytölle isompana:
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

## Hyödylliset linkit
- [Artikkeli](https://ntguardian.wordpress.com/2018/07/17/stock-data-analysis-python-v2/) osaketietojen analysoimiseen Pythonin avulla
- [Celeryn dokumentaatio](https://celery.readthedocs.io/en/latest/) liukuvan keskiarvon taskin luomiseen
- [Echartsin dokumentaatio](https://ecomfe.github.io/echarts-doc/public/en/option.html#title) visualisointimahdollisuuksien kartoittamiseen ja esimerkkien katselemiseen

## Haasteet
- Minulla on vain vähän kokemusta aikasarjadatan analyysista, joten oli vaikeuksia keksiä ja löytää tietoa, mitä toiminnallisuuksia sovellukseen kannattaisi toteuttaa
- Käyttöliittymäkirjaston, kuten Semantic-ui-react:n, käyttö nopeutti huomattavasti itselleni ei niin mielekästä käyttöliittymäkehitystä
- Echarts-kirjasto on miellyttävä käyttää echarts-for-react -kirjaston kautta, sillä siten kuvaajaa voidaan käyttää React-komponenttina










