# Ohsihan harjoitustyön vaihe 1
Päädyin luomaan sovelluksen, jonka ideana on hakea jostakin ulkoisesta rajapinnasta osakkeiden kurssien kehitystä ja arvioida sitä tulevaisuuteen koneoppimisen menetelmien avulla. Käyttäjät voivat kirjautua palveluun Google-tunnuksilla hallintapaneeliin, jossa he voivat selailla osakkeita, tallentaa haluamiaan osakkeita "seurantaan", tarkastella niiden dataa sekä ennustaa niiden tulevaisuuden kurssikehitystä. Rajapinta, josta osaketiedot haettaisiin, voisi olla esimerkiksi [IEX](https://iextrading.com/developer/docs/); tärkeää rajapinnassa on, että osakkeiden historiatiedot ovat saatavilla.

## Sovelluksen arkkitehtuuri ja teknologiat

### Arkkitehtuuri
Arkkitehtuuriltaan sovellus on moderni, [Client side MV*](https://blog.octo.com/en/new-web-application-architectures-and-impacts-for-enterprises-1/) -tyylinen, jonka eri mikropalvelukomponentteja ajetaan erillisissä Docker-konteissa. Kontteja on tällä hetkellä yhteensä 4: api (backend), ui (frontend), db (tietokanta) ja nginx (HTTP-palvelin). Ideana on, että yksi nginx-palvelin proxyttaa HTTP-pyynnöt frontendin ja backendin välillä siten, että `/api/*`-polussa HTTP-pyynnöt proxytetaan api-konttiin. Toisaalta tämä poistaa mahdollisuuden, että backend ja frontend sijaitisivat eri hosteissa (eri IP-osoite), joten saatan luoda vielä yhden nginx-kontin lisää, jotta sekä backendille että frontendille on oma edustapalvelin. Tämä myös kätevästi mahdollistaisi, että `api.example.com` voitaisiin ohjata eri IP-osoitteeseen kuin `example.com`.

Koko sovellusklusteria orkestroidaan ainakin kehitysvaiheessa docker-compose -ohjelman avulla yhdellä hostilla, mutta vaihtoehtona voisi olla käyttää tuotannossa esimerkiksi Kubernetesta, joka mahdollistaisi mikropalvelujen levittämisen eri hosteille ja sen myötä mm. paremman skaalautuvuuden. Toisaalta tämä voisi tuoda mukanaan muita haasteita, jotka eivät kenties ole niin relevantteja vasta sovelluksen toiminnallisuutta hahmotellessa.

Lisäksi erilaiset konfiguraatiotiedostot eivät vielä huomioi eroa tuotantokäytön ja sovelluskehityksen välillä; tavoitteena oli kuitenkin vasta ensin pystyttää kehitysympäristö.

### Backend/API
Olen ollut paljon tekemisissä WordPressin kanssa, joten halusin kokeilla jotakin uusia teknologioita. WordPressin teemoja ja lisäosia ohjelmoidaan PHP:lla, joten päädyin valitsemaan jonkin muun backend-ohjelmointikielen. Koska Python on syntaksiltaan mukava ja sen suurehkon suosion vuoksi löytyy paljon apua mahdollisiin ongelmatilanteisiin (StackOverflow jne.), valitsin sen backend-ohjelmointikieleksi. Lisäksi Pythonille on olemassa paljon koneoppimisen kirjastoja.

Backend-frameworkkina päädyin Flaskiin, koska en aio käyttää esim. Djangon view-puolta ollenkaan (koska datat lähetetään JSON-notaatiolla Reactille). Flaskille on olemassa myös hyviä REST-API ja SQL-kirjastoja. Koska sovelluksen backend on itsessään vain REST-rajapinta, joka palauttaa dataa JSON-notaatiossa, ei sitä ole pakko käyttää Reactin avulla; riittää vain, että lähettää HTTP-pyynnöt API:lle esim. `curl`:n avulla, ja saa API:lta vastauksen. Tämä on mielestäni huomattavan merkkittävä puolestapuhuja [Client side MV*](https://blog.octo.com/en/new-web-application-architectures-and-impacts-for-enterprises-1/) -arkkitehtuurin puolesta.

### Frontend
Frontendissa käytetään Reactia, joka hakee sisällön JSON-formaatissa backendistä/API:sta. Mm. visualisointiin ja kirjautumisen evästeiden hallintaan käytetään Reactia varten tehtyjä kirjastoja, kuten `semantic-ui-react`. Kaavioihin ja kuvaajiin olen ajatellut käyttäväni `echarts`-kirjastoa.

### Tietokanta
Tietokantana on MariaDB:n virallinen Docker-jakelu, jota ei ole muokattu millään tavalla, lukuunottamatta tietysti kontin käynnistysvaiheessa ympäristömuuttujina annettavia tietokannan käyttäjätunnuksia ja muita salaisia asioita.

### HTTP-palvelin
Edustapalvelina on Nginx. Erillisen edustapalvelimen etuna on muun muassa, että pyyntöjä voidaan kätevästi välimuistittaa Nginx:n HTTP-cacheen sekä lisätä omia HTTP-otsakkeita proxy-vaiheessa.

## Ympäristön asennus
Aluksi loin projektihakemiston, jonka juuressa on eri kansiot eri sovelluksen osille:
```
api/
nginx/
ui/
```
<sub>Tietokanta ei tarvitse omaa hakemistoaan, koska sen Docker-konttia ei ole tarpeen muuttaa omalla Dockerfile-tiedostolla.</sub>

Tämän jälkeen loin UI-kansioon React-applikaation `create-react-app`-ohjelman avulla, sekä API-kansioon Flask-projektin [Flask-boilerplaten](https://github.com/MaxHalford/flask-boilerplate) avulla. Loin eri mikropalveluja varten omat kustomoidut Dockerfilet projekteilla ja loin Dockerfile-tiedostojen pohjalta levykuvat (Docker image). Tässä vaiheessa oli jokseenkin haastavaa Dockerfilen oikeanlainen määrittely, kuten esimerkiksi kontin käyttöoikeuksien määrittely, oikeiden tiedostojen kopiointi konttiin ja ylipäänsä Dockerfilen syntaksi.

Tämän jälkeen kokeilin käynnistää api- ja MariaDB-kontteja konfiguraatiollani, ja yritin saada tietokantayhteyden api:n ja db:n välillä kuntoon. Tätä varten piti `flask-sqlalchemy` konfiguroida oikealla tietokannan osoitteella. Tietokantamuuttujat luetaan api-kontissa ympäristömuuttujina ja annetaan konfiguraatioluokassa parametrina. Ohessa ote kyseisestä tiedostosta:
```
...
mysql_user = os.environ['MYSQL_USER']
mysql_pw = os.environ['MYSQL_PASSWORD']
mysql_db = os.environ['MYSQL_DATABASE']
mysql_host = os.environ['MYSQL_DATABASE_HOST']
...
class DevConfig(Config):
    ....
    SQLALCHEMY_DATABASE_URI = f'mysql://{mysql_user}:{mysql_pw}@{mysql_host}:3306/{mysql_db}'
    ...
```
Kun sain tietokantayhteyden toimimaan luomalla testitaulun ja kirjoittamalla siihen, aloin luomaan Nginx-konfiguraatiota HTTP-pyyntöjen proxyttamiseksi portissa 80 kuuntelevalta nginx-kontilta api-konttiin polussa `/api/*` ja muutoin ui-kontille. Sain aikaiseksi seuraavankaltaisen konfiguraatiotiedoston:
```
server {
    listen       80;
    server_name  localhost;
    ...
    location /api/ {
      ...
      proxy_pass http://api:3000;
    }

    location / {
      ...
      proxy_pass http://ui:4000;
    }
}
```
Tässä vaiheessa testasin, että reititys toimii, ja API sekä UI pystyvät kommunikoimaan keskenään palauttamalla API:sta testinä JSON-notaatiota ja näyttämällä sen Reactissa.

Kun sain Dockerfilet kuntoon, aloin luomaan Docker-composea varten projektin juureen `docker-compose.yml`-tiedostoa, johon määritellään sovelluksen kaikkien Docker-konttien konfiguraatio, esimerkiksi:
- Kontin pohjana käytettävä levykuva (image)
- Hostiin mountattavat volumet. Tämä tarkoittaa, että tiedostojärjestelmä yhdistyy kontin ja oman tietokoneen (tai muun hostin) välillä, jolloin omalla koneella tehdyt muutokset päivittyvät myös konttiin (tärkeä ominaisuus, kun tekee sovelluskehitystä ja muokkaa tiedostoja omalla koneella)
- Ympäristömuuttujat
- Avatut portit
- Linkit muihin kontteihin (esim. nginx -> ui/api, api -> db)

Tietokantaa varten riitti, että loin MariaDB-konttia varten konfiguraation `docker-compose.yml`-tiedostoon, ja lisäsin tietokannan konfigurointia varten tarvittavat ympäristömuuttujat sekä MariaDB-kontille että Backend-kontille, koska Backend tarvitsee yhteyden tietokantaan. Lopullinen konfiguraatio `docker-compose.yml`-tiedostossa näytti seuraavalta:
```
version: "3"
services:
  db:
    image: mariadb:10.4.1
    env_file:
      - '.env'

  api:
    build: api
    image: l3ku/stockpal-api:0.0.1
    volumes:
      - './api/app:/app/app:rw'
    env_file:
      - '.env'
    links:
      - db

  nginx:
    build: nginx
    image: l3ku/stockpal-nginx:0.0.1
    ports:
      - '127.0.0.1:80:80'
    links:
      - api
      - ui

  ui:
    build: ui
    image: l3ku/stockpal-ui:0.0.1
    volumes:
      - './ui/app/src:/app/src:rw'
      - './ui/app/public:/app/public:rw'
    environment:
      - PORT=4000
```

Dockerin ja Docker-composen käyttöönotto määrittelyineen oli mielestäni jokseenkin aikaavievä ja haastava operaatio, mutta se helpottaa erittäin paljon sovelluskehitystä: kaikkien sovelluksen levykuvien (image) buildaamiseksi riittää komento `docker-compose build`, ja kaikkien konttien käynnistämiseksi `docker-compose up -d`. Kun Reactia ja Flaskia käytetään ns. kehitysmoodissa, ohjelmat käynnistyvät automaattisesti uudelleen muutosten kanssa.


## Tietokantaan kirjoittaminen
Harjoitustyön ensimmäisessä vaiheessa oli myös tarkoitus varmistaa, että sovellus osaa tallentaa käyttäjän syötettä tietokantaan ja lukea sitä siitä. Toteutin tässä vaiheessa sovellukseeni Googlen OAuth2-autentikoinnin, jossa tietokantamallissa on jo taulut käyttäjälle (mm. nimi, sposti, profiilikuva), kirjautuneelle käyttäjälle (sovelluksen autentikoinnin tiedot, jotka asetetaan frontissa evästeisiin) sekä OAuth2-tokenille (voidaan hakea tietoa Googlen rajapinnasta). En ollut aiemmin perehtynyt OAuth2:n toimintaan, joten sen käyttöönotto oli hieman haastavaa. Tietokantaan siis kirjoitetaan kirjautumisvaiheessa, ja luetaan kun käyttäjä yrittää hakea autentikoinnin vaativasta API-polusta dataa.


## Hyödylliseksi havaittu materiaali
- [Flask Boilerplate](https://github.com/MaxHalford/flask-boilerplate)
- [Flaskin dokumentaatio](http://flask.pocoo.org/docs/1.0/)
- [Flask-SQLAlchemyn dokumentaatio](http://flask-sqlalchemy.pocoo.org/2.3/)
- Sekä lukuisia StackOverflow-linkkejä...
