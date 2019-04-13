import React, {Component} from 'react';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
import {Icon, Button, Card, Grid, Table, Dimmer, Loader, Modal, Menu, Dropdown} from 'semantic-ui-react';
import { getStockTypeDescription } from '../utils/helpers';

// TODO: separate this component into child components
class StockChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stockChartData: [],
      stockChartMaData: [], // Data for moving average
      stockChartMaTaskID: [], // TODO: set this into local storage for persistence?
      maInterval: null,
      maPollObject: null,
      stockChartIsLoaded: false,
      error: null,
      range: '5y',
      stockLogo: '',
      stockNews: [],
      stockNewsIsLoaded: false,
      activeStockNewsArticle: null,
      stockCompany: [],
      stockCompanyIsLoaded: false,
      stockRangeIsLoading: false,
      modalComponent: null,
      stockChartIsDisabled: false
    };
  }

  componentDidMount() {
    this.fetchStockCompany();
    this.fetchStockNews();
    this.fetchStockLogo();
    this.fetchStockChart();
  }

  fetchStockLogo = () => {
    fetch('/api/v1/stock/' + encodeURIComponent(this.props.stockSymbol) + '/logo')
      .then(res => res.json())
      .then(
        (res) => {
          if ( res.success ) {
            this.setState({
              stockLogo: res.data.url,
              stockInfoIsLoaded: true
            });
          }
        },
        (err) => {
          this.setState({
            stockInfoIsLoaded: true,
            error: err
          });
        }
      );
  }

  fetchStockNews = () => {
    fetch('/api/v1/stock/' + encodeURIComponent(this.props.stockSymbol) + '/news')
      .then(res => res.json())
      .then(
        (res) => {
          this.setState({
            stockNewsIsLoaded: true,
            stockNews: res.data,
            activeStockNewsArticle: res.data[0] ? 0 : null
          });
        },
        (err) => {
          this.setState({
            stockNewsIsLoaded: true,
            error: err
          });
        }
      );
  }

  fetchStockCompany = () => {
    fetch('/api/v1/stock/' + encodeURIComponent(this.props.stockSymbol) + '/company')
      .then(res => res.json())
      .then(
        (res) => {
          this.setState({
            stockCompanyIsLoaded: true,
            stockCompany: res.data,
          });
        },
        (err) => {
          this.setState({
            stockCompanyIsLoaded: true,
            error: err
          });
        }
      );
  }


  changeFullScreen = (evt, target) => {
    evt.preventDefault();
    this.setState({modalComponent: target});
  }

  changeRange = (evt, range) => {
    evt.preventDefault();
    const stateRange = this.state.range;
    if ( range === stateRange ) {
      return;
    }

    this.setState({
        range: range,
        stockRangeIsLoading: true,
        stockChartIsDisabled: true
      },
      this.fetchStockChart
    );
  }

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

  fetchStockMovingAverage = () => {
    fetch('/api/protected/stock/' + encodeURIComponent(this.props.stockSymbol) + '/movingaverage?interval=' + encodeURIComponent(this.state.maInterval), {
      headers: {'X-API-Key': this.props.apiSecret}
    })
    .then(res => res.json())
    .then(
      (res) => {
        if (res.success) {
          this.setState({
            stockChartMaTaskID: res.data.task_id,
            maPollObject: setInterval(this.maTaskResultPoll, 4000)
          });
        } else {
          this.setState({error: res.error});
        }
      },
      (err) => {
        this.setState({
          error: err
        });
      }
    );
  }

  stopMaTaskResultPoll = () => {
    clearInterval(this.state.maPollObject)
  }

  maTaskResultPoll = () => {
    fetch('/api/protected/task/' + encodeURIComponent(this.state.stockChartMaTaskID), {
        headers: {'X-API-Key': this.props.apiSecret}
      })
      .then(res => res.json())
      .then(
        (res) => {
          // FIXME: what if an error occurs
          if ( !res.pending ) {
            this.stopMaTaskResultPoll();
            this.setState({
              stockChartMaData: res.result,
              stockChartIsDisabled: false
            });
          }
        },
        (err) => {
          this.stopMaTaskResultPoll();
          this.setState({
            error: err
          });
        }
      );
  }

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

  changeActiveStockNewsArticle = (evt, article) => {
    evt.preventDefault();
    if ( article >= 0 && article < this.state.stockNews.length ) {
      this.setState({
        activeStockNewsArticle: article
      });
    }
  }

  render() {
    let stockCompanyContent = (
      <div className="stock-company-loading-indication">
        <Dimmer active inverted>
            <Loader />
          </Dimmer>
      </div>
    );
    const stockCompany = this.state.stockCompany;
    if ( this.state.stockCompanyIsLoaded ) {
      if ( stockCompany.length === 0 ) {
        stockCompanyContent = 'Sorry, no information regarding the company was found...';
      } else {
        const type = stockCompany.issueType.toLowerCase();
        const stockTypeDescription = getStockTypeDescription(type);
        stockCompanyContent = (
          <div className="single-stock-info-wrapper">
            <a className=".single-stock-logo" href={stockCompany.website} target="_blank" alt={`Logo of ${stockCompany.companyName}`}>
              <img src={this.state.stockLogo}/>
            </a>
            <Table celled>
              <Table.Body>
                <Table.Row>
                  <Table.HeaderCell>Symbol</Table.HeaderCell>
                  <Table.Cell>{stockCompany.symbol}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.Cell>{stockCompany.companyName}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell>Issue type</Table.HeaderCell>
                  <Table.Cell>{stockTypeDescription ? stockTypeDescription : type}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell>Exchange</Table.HeaderCell>
                  <Table.Cell>{stockCompany.exchange}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell>Industry</Table.HeaderCell>
                  <Table.Cell>{stockCompany.industry ? stockCompany.industry : '-'}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell>Website</Table.HeaderCell>
                  <Table.Cell><a href={stockCompany.website ? stockCompany.website : '-'} target="_blank">{stockCompany.website}</a></Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell>Description</Table.HeaderCell>
                  <Table.Cell>{stockCompany.description ? stockCompany.description : '-'}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell>CEO</Table.HeaderCell>
                  <Table.Cell>{stockCompany.CEO}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell>Sector</Table.HeaderCell>
                  <Table.Cell>{stockCompany.sector}</Table.Cell>
                </Table.Row>
              </Table.Body>
          </Table>
          </div>
        );
      }
    }

    let stockNewsContent = (
      <div className='stock-chart-news-indication'>
        <Dimmer active inverted>
            <Loader />
          </Dimmer>
      </div>
    );
    if ( this.state.stockNewsIsLoaded ) {
      const stockNews = this.state.stockNews;
      const activeArticle = this.state.activeStockNewsArticle;
      if ( stockNews.length === 0 ) {
        stockNewsContent = 'Sorry, no news articles were found.'
      } else {
        stockNewsContent = (
          <Grid>
            <Grid.Column width={2}>
              <Button className="single-stock-news-article-toggle" onClick={(evt) => this.changeActiveStockNewsArticle(evt, this.state.activeStockNewsArticle-1)} disabled={activeArticle === 0} icon="angle left"/>
            </Grid.Column>
            <Grid.Column width={12}>
              <Card className="stockpal-card single-stock-news-card">
                <Card.Content header={`${stockNews[activeArticle].headline} (${activeArticle+1}/${stockNews.length})`}/>
                <Card.Content className="stockpal-card-content">
                  <p dangerouslySetInnerHTML={{__html: stockNews[activeArticle].summary}}></p>
                  <a href={stockNews[activeArticle].url} target="_blank">Show full article</a>
                </Card.Content>
                <Card.Content className="stockpal-card-content">
                  <div><strong><i>Posted at {new Date(stockNews[activeArticle].datetime).toLocaleString()} in {stockNews[activeArticle].source}</i></strong></div>
                </Card.Content>
              </Card>
            </Grid.Column>
            <Grid.Column width={2}>
              <Button className="single-stock-news-article-toggle" onClick={(evt) => this.changeActiveStockNewsArticle(evt, this.state.activeStockNewsArticle+1)} disabled={activeArticle === stockNews.length-1} icon="angle right"/>
            </Grid.Column>
          </Grid>
        );
      }
    }

    let stockChartContent = (
      <div className='stock-chart-loading-indication'>
        <Dimmer active inverted>
            <Loader />
          </Dimmer>
      </div>
    );
    let eChartsClass = 'stock-chart-echarts';
    if ( this.state.stockChartIsLoaded ) {
      eChartsClass += this.state.stockChartIsDisabled ? ' disabled' : '';

      const rangeOptions = [
        { name: '1d', description: 'One day' },
        { name: '1m', description: 'One month' },
        { name: '3m', description: 'Three months' },
        { name: '6m', description: 'Sixth months' },
        { name: 'ytd', description: 'Year-to-date' },
        { name: '1y', description: 'One year' },
        { name: '2y', description: 'Two years' },
        { name: '5y', description: 'Five years' }
      ];
      const movingAverageRangeOptions = [25, 50, 75, 100, 150, 200, 300, 400, 500];
      stockChartContent = (
        <Grid>
          <Grid.Column width={2}>
          <Menu secondary size='small' vertical className="stock-chart-actions-menu">
            <Menu.Item header>Actions</Menu.Item>
            <Dropdown item scrolling text='Moving average' disabled={!this.props.apiSecret}>
              <Dropdown.Menu>
                <Dropdown.Header>Interval</Dropdown.Header>
                {movingAverageRangeOptions.map(option => {
                  return (
                    <Dropdown.Item key={option} active={this.state.maInterval === option} onClick={() => this.setState({maInterval: option, stockChartIsDisabled: true}, this.fetchStockMovingAverage)}disabled={this.state.stockChartData.length <= option}>{option}</Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
            </Menu>
          </Grid.Column>
          <Grid.Column width={14}>
            <div className='stock-chart-range-options'>
              {rangeOptions.map(option => {
                var className = 'stock-chart-range-option';
                className += this.state.range === option.name ? ' selected' : '';
                className += this.state.stockRangeIsLoading ? ' disabled' : '';
                return (
                  <div key={option.name} className="stock-chart-range-option-wrapper">
                    <a href="#" className={className} onClick={(evt) => this.changeRange(evt, option.name)}>{option.name}</a>
                    <span className="stock-chart-range-option-tooltip">{option.description}</span>
                  </div>
                );
              })}
            </div>
            <ReactEcharts className={eChartsClass} theme="macarons" option={this.getOption()}/>
          </Grid.Column>
        </Grid>
      );
    }

    return (
      <section className="single-stock">
        <div className="single-stock-back-icon-wrapper">
          <a href="#" onClick={this.props.backButtonClickHandler}>
            <Icon name='arrow left' size='large'/>Back
          </a>
        </div>
        <Card className="stockpal-card single-stock-title-card">
          <Card.Content header={stockCompany.companyName ? stockCompany.companyName : 'Loading...'} />
        </Card>
        <Grid>
          <Grid.Column width={8} className="stock-view-column">
            <Card className="stockpal-card single-stock-card stock-card-information">
              <Card.Content className="single-stock-card-header">
                <div className="header">Company</div>
                <div className="expand-stock-chart-section-wrapper">
                  <a href="#" onClick={(evt) => this.changeFullScreen(evt, 'stockCompany')} className="expand-stock-chart-section-button" ><Icon name="expand arrows alternate"/></a>
                </div>
              </Card.Content>
              <Card.Content className="stockpal-card-content">
                <Modal
                  className='stock-modal'
                  dimmer='blurring'
                  open={this.state.modalComponent === 'stockCompany'}
                  onClose={() => this.setState({ modalComponent: null })}
                  size='large'
                  closeIcon
                  centered={false}
                >
                  {stockCompanyContent}
                </Modal>
                {stockCompanyContent}
              </Card.Content>
            </Card>
          </Grid.Column>
          <Grid.Column width={8} className="stock-view-column">
            <Card className="stockpal-card single-stock-card stock-card-news">
              <Card.Content className="single-stock-card-header">
                <div className="header">News</div>
                <div className="expand-stock-chart-section-wrapper">
                  <a href="#" onClick={(evt) => this.changeFullScreen(evt, 'stockNews')} className="expand-stock-chart-section-button" ><Icon name="expand arrows alternate"/></a>
                </div>
              </Card.Content>
              <Card.Content className="stockpal-card-content">
                <Modal
                  className='stock-modal'
                  dimmer='blurring'
                  open={this.state.modalComponent === 'stockNews'}
                  onClose={() => this.setState({ modalComponent: null })}
                  size='large'
                  closeIcon
                  centered={false}
                >
                  {stockNewsContent}
                </Modal>
                {stockNewsContent}
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid>
        <Grid>
          <Grid.Column width={16} className="stock-view-column">
            <Card className="stockpal-card single-stock-card stock-card-chart">
              <Card.Content className="single-stock-card-header">
                <div className="header">Chart</div>
                <div className="expand-stock-chart-section-wrapper">
                  <a href="#" onClick={(evt) => this.changeFullScreen(evt, 'stockChart')} className="expand-stock-chart-section-button" ><Icon name="expand arrows alternate"/></a>
                </div>
              </Card.Content>
              <Card.Content className="stockpal-card-content">
                <Modal
                  className='stock-modal'
                  dimmer='blurring'
                  open={this.state.modalComponent === 'stockChart'}
                  onClose={() => this.setState({ modalComponent: null })}
                  size='large'
                  closeIcon
                  centered={false}
                >
                  {stockChartContent}
                </Modal>
                {stockChartContent}
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid>
      </section>
    );
  }
}

const mapStateToProps = state => {
  return {
    apiSecret: state.auth.apiSecret
  }
};


export default connect(mapStateToProps)(StockChart)

