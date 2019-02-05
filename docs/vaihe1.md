# Ohsihan harjoitustyön vaihe 1
Päädyin luomaan sovelluksen, jonka ideana on hakea jostakin ulkoisesta rajapinnasta osakkeiden kurssien kehitystä ja arvioida sitä tulevaisuuteen koneoppimisen menetelmien avulla. Käyttäjät voivat kirjautua palveluun Google-tunnuksilla hallintapaneeliin, jossa he voivat selailla osakkeita, tallentaa haluamiaan osakkeita "seurantaan", tarkastella niiden dataa sekä ennustaa niiden tulevaisuuden kurssikehitystä. Rajapinta, josta osaketiedot haettaisiin, voisi olla esimerkiksi [IEX](https://iextrading.com/developer/docs/); tärkeää rajapinnassa on, että osakkeiden historiatiedot ovat saatavilla.

## Sovelluksen arkkitehtuuri ja teknologiat

### Arkkitehtuuri
Arkkitehtuuriltaan sovellus on moderni, [Client side MV*](https://blog.octo.com/en/new-web-application-architectures-and-impacts-for-enterprises-1/) -tyylinen, jonka eri mikropalvelukomponentteja ajetaan erillisissä Docker-konteissa. Kontteja on tällä hetkellä yhteensä 4: api (backend), ui (frontend), db (tietokanta) ja nginx (HTTP-palvelin). Ideana on, että yksi nginx-palvelin proxyttaa HTTP-pyynnöt frontendin ja backendin välillä siten, että `/api`-polussa pyynnöt proxytetaan api-konttiin. Toisaalta tämä poistaa mahdollisuuden, että backend ja frontend sijaitisivat eri hosteissa (eri IP-osoite), joten saatan luoda vielä yhden nginx-kontin lisää, jotta sekä backendille että frontendille on oma edustapalvelin. Tämä myös kätevästi mahdollistaisi, että `api.example.com` voitaisiin ohjata eri IP-osoitteeseen kuin `example.com`.

Koko sovellusklusteria orkestroidaan ainakin kehitysvaiheessa docker-compose -ohjelman avulla yhdellä hostilla, mutta vaihtoehtona voisi olla käyttää tuotannossa esimerkiksi Kubernetesta, joka mahdollistaisi mikropalvelujen levittämisen eri hosteille ja sen myötä mm. paremman skaalautuvuuden. Toisaalta tämä voisi tuoda mukanaan muita haasteita, jotka eivät kenties ole niin relevantteja vasta sovelluksen toiminnallisuutta hahmotellessa.

### Backend
Olen ollut työssäni paljon tekemisissä WordPressin kanssa, joten halusin kokeilla jotakin uusia teknologioita. WordPressin teemoja ja lisäosia ohjelmoidaan PHP:lla, joten päädyin valitsemaan jonkin muun backend-ohjelmointikielen. Koska Python on syntaksiltaan mukava ja sen suurehkon suosion vuoksi löytyy paljon apua mahdollisiin ongelmatilanteisiin (StackOverflow jne.). Lisäksi Pythonille on olemassa paljon koneoppimisen kirjastoja.

Backend-frameworkkina päädyin Flaskiin, koska en aio käyttää esim. Djangon view-puolta ollenkaan (koska datat lähetetään JSON-notaatiolla Reactille). Flaskille on olemassa myös hyviä REST-API ja SQL-kirjastoja. Koska sovelluksen backend on itsessään vain REST-rajapinta, joka palauttaa dataa JSON-notaatiossa, ei sitä ole pakko käyttää Reactin avulla; riittää vain, että lähettää HTTP-pyynnöt API:lle esim. `curl`:n avulla, ja saa API:lta vastauksen. Tämä on mielestäni huomattavan merkkittävä puolestapuhuja [Client side MV*](https://blog.octo.com/en/new-web-application-architectures-and-impacts-for-enterprises-1/) -arkkitehtuurin puolesta.

### Frontend
Frontendissa käytetään Reactia, joka hakee sisällön JSON-formaatissa backendistä. Mm. visualisointiin ja kirjautumisevästeidn hellintaan käytetään Reactia varten tehtyjä kirjastoja, kuten `semantic-ui-react`.

### Tietokanta
Tietokantana on MariaDB:n virallinen Docker-konttijakelu, jota ei ole muokattu millään tavalla, lukuunottamatta tietysti kontin käynnistysvaiheessa ympäristömuuttujina annettavia tietokannan käyttäjätunnuksia ja muita salaisia asioita.

### HTTP-palvelin
Edustapalvelina on Nginx. Erillisen edustapalvelimen idea on, että pyyntöjä voidaan kätevästi välimuistittaa Nginx:n HTTP-cacheen sekä lisätä omia HTTP-otsakkeita proxy-vaiheessa.

## Ympäristön asennus
Aluksi loin projektihakemiston, jonka juuressa on eri kansiot eri sovelluksen osille:
```
api/
nginx/
ui/
```
Tietokanta ei tarvitse omaa hakemistoaan, koska sen Docker-konttia ei ole tarpeen muuttaa omalla Dockerfile-tiedostolla.
Tämän jälkeen loin UI-kansioon React-applikaation `create-react-app`-ohjelman avulla, sekä API-kansioon Flask-projektin [Flask-boilerplaten](https://github.com/MaxHalford/flask-boilerplate) avulla. Loin omat kustomoidut Dockerfilet projekteille, buildasin kontit, ja käynnistin ne. Tässä vaiheessa oli jokseenkin haastavaa Dockerfilen oikeanlainen määrittely, kuten esimerkiksi kontin käyttöoikeuksien määrittely, oikeiden tiedostojen kopiointi konttiin ja ylipäänsä Dockerfilen syntaksi.
Kun sain Dockerfilet kuntoon, aloin luomaan Docker-composea varten projektin juureen `docker-compose.yml`-tiedostoa, johon määritellään sovelluksen kaikki Docker-konttien konfiguraatio, esimerkiksi:
- Kontin pohjana käytettävä levykuva (image)
- Hostiin mountattavat volumet. Tämä tarkoittaa, että tiedostojärjestelmä yhdistyy kontin ja oman tietokoneen (tai muun hostin) välillä, jolloin omalla koneella tehdyt muutokset päivittyvät myös konttiin => hyvin olennaista, kun tekee sovelluskehitystä ja muuttaa tiedostoja omalla koneella
- Ympäristömuuttujat
- Avatut portit
- Linkit muihin kontteihin (esim. nginx -> ui/api, api -> db)

Tietokannan käyttöönottoa varten riitti, että loin MariaDB-konttia varten konfiguraation `docker-compose.yml`-tiedostoon, ja lisäsin tietokannan konfigurointia varten tarvittavat ympäristömuuttujat sekä MariaDB-kontille että Backend-kontille, koska Backend tarvitsee yhteyden tietokantaan. Lopullinen konfiguraatio `docker-compose.yml`-tiedostossa näytti seuraavanlaiselta:
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

Dockerin ja Docker-composen käyttöönotto määrittelyineen oli mielestäni jokseenkin aikaavievä operaatio, mutta se helpottaa erittäin paljon sovelluskehitystä: kaikkien sovelluksen levykuvien (image) buildaamiseksi riittää komento `docker-compose build`, ja kaikkien konttien käynnistämiseksi `docker-compose up -d`.

## Hyödylliseksi havaittu materiaali
- [Flask Boilerplate](https://github.com/MaxHalford/flask-boilerplate)
- [Flaskin dokumentaatio](http://flask.pocoo.org/docs/1.0/)
- [Flask-SQLAlchemyn dokumentaatio](http://flask-sqlalchemy.pocoo.org/2.3/)
- Sekä lukuisia StackOverflow-linkkejä...
