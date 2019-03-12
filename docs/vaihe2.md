Leo Toikka
leo.toikka@tuni.fi

# Harjoitustyön vaihe 2
Sovelluksen ohjelmakoodi on  julkisesti saatavilla [GitHubissa](https://github.com/l3ku/stockpal), jossa olen myös hyödyntänyt GitHubin [projects-toiminnallisuutta](https://github.com/l3ku/stockpal/projects) ja issueita TODO-trackerin roolissa. Toteutin kirjautumisen jo ennen ensimmäisen vaiheen palautusta, mutta kuvailen sen toteuttamista tässä toisen vaiheen palautuksessa tarkemmin. Ensimmäiseen vaiheeseen verrattuna sovelluksen arkkitehtuuri on hieman käytännön syistä laajentunut kahden uuden Docker-kontin käyttöönoton myötä.

## Päivittynyt arkkitehtuuri
Sovelluksessa on tarve ylläpitää listaa osakkeista, joiden tiedot on hankittavissa ulkoisesta [IEX:n rajapinnasta](https://iextrading.com/developer/docs/#reference-data). Käytännössä tämä tapahtuu päivittämällä sovelluksen tietokannan listausta saatavilla olevista osakkeista ajoittain, esimerkiksi tunnin välein. Koska ulkoiset API-kutsut ovat hitaita ja n. 9000 osakkeen prosessoimisessa menee jonkin verran aikaa, ei tätä ole järkevää tehdä esimerkiksi sovelluksen API:lle saapuvien HTTP-pyyntöjen yhteydessä ja siten odotuttaa HTTP-pyynnön lähettäjää eli sovelluksen käyttäjää turhaan. Sen sijaan sovelluksen käytössä kannattaa olla erillinen tehtävänäjono, johon lisättyjä tehtäviä HTTP-pyyntöjen käsittelyn näkökulmasta erillinen worker-prosessi suorittaa. Tätä varten sovellukseen on lisätty [Celery](https://celery.readthedocs.io/en/latest/), joka on eräänlainen Python-moduulina käytettävissä oleva hajautettu tehtäväjono.
Koska Docker-kontit ovat lähinnä tarkoitettu yhden prosessin ajamiseen, eikä esimerkiksi systemd-daemoneita ole järkevä ajaa Dockerissa, täytyi Celeryä varten luoda uusi Docker-kontti, joka kommunikoi ns. [Brokerina](https://celery.readthedocs.io/en/latest/getting-started/brokers/index.html#broker-toc) toimivan [Rediksen](https://redis.io/) kautta Flask-applikaation kanssa. Eli tässä tapauksessa yhteensä kontteja tarvittiin lisää kaksi kappaletta, yksi Celery-workerin käyttämiseksi ja toinen Redikselle.
Celeryn käyttöönotto helpottaa myös huomattavasti mahdollisia ohjelmaan tulevaisuudessa lisättäviä koneoppimisalgoritmien käyttöä, sillä ne ovat yleensä jokseenkin hitaita; Celeryn avulla ne voidaan suorittaa asynkronisesti erillisellä workerilla, jolloin HTTP-palvelin voi lopputulosta palauttaa esimerkiksi "result: pending" -tilan avulla tiedon, että Celery ei ole vielä suorittanut operaatiota kokonaan eikä siten tulos ole vielä saatavilla.
Esimerkkikoodi, jolla saadaan Celerylle lisättyä tehtävä (task):
```
from celery import Celery

celery = Celery('app', broker='redis://redis:6379', backend='redis://redis:6379')

@celery.task
def updateStocksFromAPI():
    response = requests.get(iex_api_url + '/ref-data/symbols')
    all_stocks = response.json()
    ...
```
Kyseinen tehtävä käsketään tunneittain suoritettavaksi Celeryä alustettavessa beat_schedule-toiminnallisuuden avulla:
```
def create_celery(celery, app):
    celery.conf.update(app.config)
    celery.conf.beat_schedule = {
        'update-stocks-every-hour': {
            'task': 'app.tasks.updateStocksFromAPI',
            'schedule': 3600,
        },
    }
```
Celery vaatii myös Flaskin nk. applikaatiokontekstin tehtävien tietoon. Tämä tehdään tekemällä aliluokka Celeryn TaskBase-luokasta [Flaskin Celery-pattern -dokumentaation](http://flask.pocoo.org/docs/0.12/patterns/celery/) mukaisesti:
```
    TaskBase = celery.Task
    class ContextTask(TaskBase):
        abstract = True
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)

    celery.Task = ContextTask
    return celery
```
## Kirjautuminen / uloskirjautuminen
Sovelluksen kirjautuminen toimii siten, että erillisiä salasanoja ei toistaiseksi syötetä sovellukseen eikä mitään omaa rekisteröitymistä sovellukseen vaadita, vaan kirjautuminen perustuu Googlen OAuth2-rajapintaan, jota käytetään Flask-sovelluksessa *authlib*-kirjaston avulla. Kirjautuminen lähtee liikkeelle siitä, että sovelluksen backend/API (eli Flask-sovellus) palauttaa tarvittavan URL:n Googlen OAuth2-kirjautumisen tekemiseen, ja selain uudelleenohjaa tähän osoitteeseen. Periaatteessa kyseisen osoite voitaisiin myös luoda frontendissa React-applikaatiossa, mutta tämä vaatisi sovelluskohtaisen Googlen API-avaimen ja secretin sisältämistä frontendin koodiin ja siten sen paljastamista käyttäjälle.
Uudelleenohjauksessa pyydetään Googlen palvelimella käyttäjältä vahvistusta omien tietojensa luovuttamiseen sovellukselle. Tämän jälkeen Google ohjaa takaisen sovellukseen aiemmin Googlelle URL:ssa ilmoitettuun redirect callback-osoitteeseen. Kun ohjaus takaisin sovellukseen tehdään Googlen puolseta, uudessa URL:ssa on mukana tieto, jonka avulla OAuth2-token, eli eräänlainen avain käyttäjän tietoihin käsiksi pääsemiseksi, voidaan hankkia; siten koko URL lähetetään takaisin sovelluksen API:lle (eli "authorization_response" alla):
```
return fetch('/api/oauth/login/' + escape(login_provider), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        'authorization_response': window.location.href
    })})
    ...
```
Tämän jälkeen sovelluksen API lähettää Googlelle kyseisen "authorization_reponse" -arvon, ja saa Googlelta tarvittavan OAuth2-tokenin, jolla käyttäjän tietoja voidaan hakea Googlen palvelimelta ("auth_response"-muuttujan sisältö alla):
```
def OAuth2Login(auth_provider, auth_response):
    provider_data = getOAuth2ProviderData(auth_provider)
    redirect_uri = request.url_root + 'login/' + auth_provider
    oauth_session = OAuth2Session(provider_data['session']['client_id'], provider_data['session']['client_secret'], state=session[f'{auth_provider}_oauth_state'], redirect_uri=redirect_uri)
    oauth_token = oauth_session.fetch_access_token(provider_data['access_token_url'], authorization_response=auth_response)

    # Use the token to obtain user information
    user_name, user_email, user_picture = getUserInfoWithAcessToken(auth_provider, oauth_token['access_token'])
```
OAuth2-token tallennetaan tietokantaan, jotta sillä voidaan hakea sen voimassaoloajan puitteessa jatkuvasti tietoja:
```
MariaDB [stockpal_dev]> describe o_auth2_token;
+---------------+---------------+------+-----+---------+-------+
| Field         | Type          | Null | Key | Default | Extra |
+---------------+---------------+------+-----+---------+-------+
| user_id       | int(11)       | NO   | PRI | NULL    |       |
| provider      | varchar(50)   | YES  |     | NULL    |       |
| token_type    | varchar(2000) | YES  |     | NULL    |       |
| access_token  | varchar(1000) | NO   |     | NULL    |       |
| refresh_token | varchar(1000) | YES  |     | NULL    |       |
| expires_at    | int(11)       | YES  |     | NULL    |       |
+---------------+---------------+------+-----+---------+-------+
6 rows in set (0.001 sec)
```
Toistaiseksi tietoja ei haeta/päivitetä muuten kuin kirjautuessa sisään, mutta tokenin säilyttäminen mahdollistaisi esim. käyttäjien tietojen "refreshin" manuaalisesti. Saatan poistaa tämän taulun tietomallista, mikäli sille ei synny tarvetta jatkossa.
Ensimmäistä kertaa sovellukseen kirjautuessa tarkistetaan, että onko Googlen rajapinnan välittämää sähköpostiosoitetta olemassa. Jos ei, niin käyttäjälle luodaan rivi erilliseen käyttäjätauluun:
```
MariaDB [stockpal_dev]> describe user;
+-------------+--------------+------+-----+---------+----------------+
| Field       | Type         | Null | Key | Default | Extra          |
+-------------+--------------+------+-----+---------+----------------+
| id          | int(11)      | NO   | PRI | NULL    | auto_increment |
| name        | varchar(20)  | NO   | UNI | NULL    |                |
| email       | varchar(100) | NO   | UNI | NULL    |                |
| picture_url | varchar(200) | YES  |     | NULL    |                |
+-------------+--------------+------+-----+---------+----------------+
4 rows in set (0.002 sec)
````
Jos käyttäjän tiedot löytyvät sähköpostiosoitteella, päivitetään ne vastaamaan Googlen rajapinnasta saatuja tietoja. Käyttäjätaulun ja OAuth2-token -taulun lisäksi tietokannassa on myös erillinen taulu kirjautuneille käyttäjille,
jossa on käyttäjän tunnistautumiseen sovellukselle päin tarvittavat ID:t ja avaimet:
```
MariaDB [stockpal_dev]> describe logged_in_user;
+--------------+---------------+------+-----+---------+-------+
| Field        | Type          | Null | Key | Default | Extra |
+--------------+---------------+------+-----+---------+-------+
| user_id      | int(11)       | NO   | PRI | NULL    |       |
| login_id     | varchar(200)  | NO   | UNI | NULL    |       |
| login_secret | varchar(1000) | NO   |     | NULL    |       |
| expires_at   | int(11)       | YES  |     | NULL    |       |
+--------------+---------------+------+-----+---------+-------+
4 rows in set (0.001 sec)
```
Kun käyttäjä kirjautuu sisään, lähetetään login_id- ja login_secret kenttien sisältö käyttäjälle. Päästäkseen käsiksi omiin tietoihinsa, käyttäjän tulee lähettää API-pyynnössään login_id ja login_secret kenttien sisältö (tämän vuoksi ne on hyvä tallentaa selaimen eväisteisiin frontendissa). Mikäli tiedot ovat oikeat ja kirjautuminen ei ole vanhentunut (expires_at), voidaan käyttäjän tiedot palauttaa tekemällä SQL-joinin kirjautuneiden käyttäjien taulun (logged_in_user) ja käyttäjätaulun (user) välillä logged_in_user.user_id-kentän avulla. Toistaiseksi myös login_secret on selvätekstinä käyttäjän evästeissä, mutta tietoturvan parantamiseksi voisi olla järkevää mahdollisesti käyttää jotakin hash-algoritmia yhdessä käyttäjäkohtaisen salt-arvon kanssa.
Toistaiseksi käyttäjän kirjautuessa kerran sisään, hänen tietonsa säilyvät ikuisesti user-taulussa. On kuitenkin myöhemmässä vaiheessa mahdollista toteuttaa käyttäjän omien tietojen poisto, jossa hänet kirjataan ulos ja hänen rivinsä user-taulusta poistetaan => hänen tietojaan ei enää jää lainkaan sovellukseen, kun SQL:n `ON DELETE CASCADE` -eheyspolitiikka huolehtii käyttäjän resurssien poistamisesta automaattisesti.

Käyttöliittymän puolelta kirjautuminen näyttää seuraavanlaiselta:
1. Kirjautumismodaali, joka avautuu "Sign in" -nappia painamalla. Kirjautumismodaalissa on tarkoitus näyttää kaikki kirjautumisvaihtoehdot, jotka API kertoo, mutta tällä hetkellä ainoastaan Google OAauth2 on saatavilla:
![Screen Shot 2019-03-13 at 13.59.15.png](https://www.dropbox.com/s/8rvtxl22svpnyzh/Screen%20Shot%202019-03-13%20at%2013.59.15.png?dl=0&raw=1)
2. OAuth2-kirjautumisnäkymä Googlen palvelimella:
![Screen Shot 2019-03-13 at 13.59.24.png](https://www.dropbox.com/s/a2cosdhd9k00dps/Screen%20Shot%202019-03-13%20at%2013.59.24.png?dl=0&raw=1)
3. Kirjautumisen jälkeinen uudelleenohjaus ohjaa takaisin sovellukseen, nyt "Sign in" -nappi onkin käyttäjän kuva ja nimi, sekä valikko, josta voi mm. kirjautua ulos:
![Screen Shot 2019-03-13 at 14.02.26.png](https://www.dropbox.com/s/7d7x1zeimfa9a7g/Screen%20Shot%202019-03-13%20at%2014.02.26.png?dl=0&raw=1)


## Käyttäjän omien osakkeiden lisääminen ja poisto (CRUD)
Kuten aiemmin mainittiin, tietokannassa on stock-taulussa tieto IEX:n API:sta saatavilla olevista osakkeista. Käyttäjän on myös mahdollista lisätä itselleen osakkeita erilliseen user_stock -tauluun, jossa on yksinkertaisesti yhdistetty käyttäjän user_id ja yksi osakesymboli:
```
MariaDB [stockpal_dev]> describe user_stock;
+--------------+-------------+------+-----+---------+-------+
| Field        | Type        | Null | Key | Default | Extra |
+--------------+-------------+------+-----+---------+-------+
| user_id      | int(11)     | NO   | PRI | NULL    |       |
| stock_symbol | varchar(20) | NO   | PRI | NULL    |       |
+--------------+-------------+------+-----+---------+-------+
2 rows in set (0.001 sec)
```
Sovelluksen API:iin lisättiin flask-restful -kirjaston avulla logiikka käyttäjän omien osakkeiden hakemiseksi, lisäämiseksi ja poistamiseksi HTTP GET, POST- ja DELETE-metodien avulla (eli HTTP-pyyntö tehdään aina samaan osoitteeseen, vain eri metodilla):
```
class UserStocks(Resource):
    def get(self, login_id):
        try:
            success, obj = authenticate(login_id)
            if not success:
                return {'success': False, 'error': obj}
            db_user = obj # In case of success we know that obj is the DB model user instead of error object
            stocks = db_user.getStocks()
             # Collect the information inside a list of dicts
            return_data = []
            for stock in stocks:
                return_data.append({'symbol': stock.symbol, 'name': stock.name, 'type': stock.type, 'is_enabled': stock.is_enabled})
            return {'success': True, 'data': return_data}
        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err), 'target': None}}
        except AuthlibBaseError as err:
            return {'success': False, 'error': {'reason': 'err.description', 'target': None}}

    def post(self, login_id):
        try:
            success, obj = authenticate(login_id)
            if not success:
                return {'success': False, 'error': obj}
            db_user = obj # In case of success we know that obj is the DB model user instead of error object
            parser = reqparse.RequestParser()
            parser.add_argument('stock_symbol', required=True, help="Stock symbol is required")
            args = parser.parse_args()
            return db_user.addStock(args['stock_symbol'])

        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err), 'target': None}}
        except AuthlibBaseError as err:
            return {'success': False, 'error': {'reason': err.description, 'target': None}}

    def delete(self, login_id):
        try:
            success, obj = authenticate(login_id)
            if not success:
                return {'success': False, 'error': obj}
            db_user = obj # In case of success we know that obj is the DB model user instead of error object
            parser = reqparse.RequestParser()
            parser.add_argument('stock_symbol', required=True, help="Stock symbol is required")
            args = parser.parse_args()
            return db_user.deleteStock(args['stock_symbol'])

        except ValueError as err:
            return {'success': False, 'error': {'reason': str(err), 'target': None}}
        except AuthlibBaseError as err:
            return {'success': False, 'error': {'reason': err.description, 'target': None}}
```
Käyttöliittymän puolella osakelistauksen taulukkonäkymä näyttää tällä hetkellä alla olevalta:
![Screen Shot 2019-03-13 at 13.47.04.png](https://www.dropbox.com/s/f89fjhfzl74b864/Screen%20Shot%202019-03-13%20at%2013.47.04.png?dl=0&raw=1)
Käyttäjän on mahdollista selata taulukkomuodossa olevaa osakelistausta sivuittain, vaikuttaen yhdellä sivulla listattavaan määrään:
![Screen Shot 2019-03-13 at 13.51.51.png](https://www.dropbox.com/s/vvpikcf4i3z0f15/Screen%20Shot%202019-03-13%20at%2013.51.51.png?dl=0&raw=1)
Taulukosta on myös mahdollista osakkeiden tietojen selaamisen lisäksi lisätä niitä omiksi "Add"-napista sisäänkirjautuneena, jolloin ne ilmestyvät "My Stocks" osioon:
![Screen Shot 2019-03-13 at 13.55.42.png](https://www.dropbox.com/s/fu8k7f3b7wegokc/Screen%20Shot%202019-03-13%20at%2013.55.42.png?dl=0&raw=1)
Remove-nappia painamalla käyttäjä voi poistaa osakkeen omasta lisauksestaan:
![Screen Shot 2019-03-13 at 13.58.20.png](https://www.dropbox.com/s/4egvkl3r4vmns4s/Screen%20Shot%202019-03-13%20at%2013.58.20.png?dl=0&raw=1)


## Kohdatut vaikeudet
- Celeryn käyttöönotto yhdessä Dockerin kanssa oli vaikeaa: millä tavalla Celery:n workeria voidaan ajaa yhdessä kontissa uwsgin kanssa, jos API-kontti ajaa entrypointtina uwsgi-palvelimen pystyyn? => onneksi löytyi tutoriaali, jossa neuvottiin käyttämään erillistä konttia. Koko konsepti on ylipäänsä erittäin vaikea esimerkiksi ymmärtää, miten Redis-broker toimii ja kuinka erillisen Docker-kontin Flask-applikaatiossa kutsumalla Celery taskia sen suoritus alkaa toisessa Docker kontissa workerin toimesta? Pyrin toisaalta tässä vain mukailemaan tutoriaaleja, koska asian syvällinen ymmärtäminen ja siihen perehtyminen olisi vienyt aika kauan aikaa...
- Otin myös Reduxin käyttöön UI-applikaatioon, koska Reactin komponenteissa sovelluksen tilan (state) säilyttäminen ei oikein soveltunut tähän sovellukseen: aina kun komponentti unmountattiin, sen tila hävisi, eli monesti tämä tarkoitti jo API:sta haetun tiedon (esim. osakelistauksen menettämistä). Eräs vaihtoehto olisi ollut pitää kaikkea tilaa korkeimman tason komponentissa (=sotkuista spagettia), jota ei mountata, tai sitten pitää tila jossain ulkopuolisessa paikassa (=Reduxin store). En esitellyt sen käyttönoton prosessia tässä dokumentissa, koska sitä olisi ollut vaikeaa kuvailla lyhyesti. Käyttöönotto aiheutti kuitenkin vaikeuksia, koska en ole kovinkaan kokenut Frontend-kehittäjä eikä siten ollut Reduxia aiemmin käyttänyt ja sen oma terminologia, kuten Store, Reducerit ja Actionit ja niiden välinen toiminta ja dataflow oli minulle täysin vierasta. Internet-resurssit olivat tässäkin myös hyödyksi.
- Kolmas haaste on ollut miettiä sovelluksen toimintalogiikkaa käyttäjälle päin: mitä käyttäjä hyötyy siitä, että hän tallentaa itselleen osakkeita? Pitäisikö osakkeiden kurssit hakea sovelluksen tietokantaan ja päivittää ajoittain, vai haetaanko tieto aina IEX:n rajapinnasta? Millä tavalla käyttäjä voi ennustaa osakkeiden kursseja?

## Hyödylliset linkit
- https://citizen-stig.github.io/2016/02/17/using-celery-with-flask-factories.html
- https://github.com/nickjj/build-a-saas-app-with-flask
- http://flask.pocoo.org/docs/0.12/patterns/celery/
- https://react-redux.js.org/introduction/quick-start





