import React, {Component} from 'react';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
import {Icon, Button, Card, Grid, Table} from 'semantic-ui-react';
import { getStockTypeDescription } from '../utils/helpers';

// TODO: separate this component into child components
class StockChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stockChartData: [],
      stockChartIsLoaded: false,
      error: null,
      interval: '5y',
      stockLogo: '', // TODO: provide a default stock logo
      stockNews: [],
      stockNewsIsLoaded: false,
      activeStockNewsArticle: null,
      stockCompany: [],
      stockCompanyIsLoaded: false
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
          this.setState({
            stockLogo: res.data.url,
            stockInfoIsLoaded: true
          });
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

  changeInterval = (interval) => {
    const stateInterval = this.state.interval;
    if ( interval === stateInterval ) {
      return;
    }

    this.setState({
        interval: interval,
        stockChartIsLoaded: false
      },
      this.fetchStockChart
    );
  }

  fetchStockChart = () => {
    fetch('/api/v1/stock/' + encodeURIComponent(this.props.stockSymbol) + '/chart?range=' + encodeURIComponent(this.state.interval))
      .then(res => res.json())
      .then(
        (res) => {
          this.setState({
            stockChartIsLoaded: true,
            stockChartData: res.data
          });
        },
        (err) => {
          this.setState({
            stockChartIsLoaded: true,
            error: err
          });
        }
      );
  }

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

  changeActiveStockNewsArticle = (article) => {
    if ( article >= 0 && article < this.state.stockNews.length ) {
      this.setState({
        activeStockNewsArticle: article
      });
    }
  }

  render() {
    let stockCompanyContent = (
      <div className="stock-company-loading-indication">Loading stock company info...</div>
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
            <a className=".single-stock-logo" href={stockCompany.website} alt={`Logo of ${stockCompany.companyName}`}>
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
                  <Table.Cell>{stockCompany.industry}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell>Website</Table.HeaderCell>
                  <Table.Cell><a href={stockCompany.website} target="_blank">{stockCompany.website}</a></Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.HeaderCell>Description</Table.HeaderCell>
                  <Table.Cell>{stockCompany.description}</Table.Cell>
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
      <div className='stock-chart-news-indication'>Loading stock news...</div>
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
              <Button className="single-stock-news-article-toggle" onClick={() => this.changeActiveStockNewsArticle(this.state.activeStockNewsArticle-1)} disabled={activeArticle === 0} icon="angle left"/>
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
              <Button className="single-stock-news-article-toggle" onClick={() => this.changeActiveStockNewsArticle(this.state.activeStockNewsArticle+1)} disabled={activeArticle === stockNews.length-1} icon="angle right"/>
            </Grid.Column>
          </Grid>
        );
      }
    }

    let stockChartContent = (
      <div className='stock-chart-loading-indication'>Loading stock chart...</div>
    );
    let eChartsClass = 'stock-chart-echarts';
    if ( this.state.stockChartIsLoaded || (!this.state.stockChartIsLoaded && this.state.stockChartData.length > 0) ) {
      eChartsClass += this.state.stockChartIsLoaded ? '' : ' disabled';

      const intervalOptions = [
        { name: '1d', description: 'One day' },
        { name: '1m', description: 'One month' },
        { name: '3m', description: 'Three months' },
        { name: '6m', description: 'Sixth months' },
        { name: 'ytd', description: 'Year-to-date' },
        { name: '1y', description: 'One year' },
        { name: '2y', description: 'Two years' },
        { name: '5y', description: 'Five years' }
      ];
      stockChartContent = (
        <>
          <div className='stock-chart-interval-options'>
            {intervalOptions.map(option => {
              var className = 'stock-chart-interval-option';
              className += this.state.interval === option.name ? ' selected' : '';
              return (
                <div className="stock-chart-interval-option-wrapper">
                  <a key={option.name} href="#" className={className} onClick={() => this.changeInterval(option.name)}>{option.name}</a>
                  <span className="stock-chart-interval-option-tooltip">{option.description}</span>
                </div>
              );
            })}
          </div>
          <ReactEcharts className={eChartsClass} option={this.getOption()}/>
        </>
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
              <Card.Content header="Information" className="single-stock-card-header"/>
              <Card.Content className="stockpal-card-content">
                {stockCompanyContent}
              </Card.Content>
            </Card>
          </Grid.Column>
          <Grid.Column width={8} className="stock-view-column">
            <Card className="stockpal-card single-stock-card stock-card-news">
              <Card.Content header="News" className="single-stock-card-header"/>
              <Card.Content className="stockpal-card-content">
                {stockNewsContent}
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid>
        <Grid>
          <Grid.Column width={16} className="stock-view-column">
            <Card className="stockpal-card single-stock-card stock-card-chart">
              <Card.Content header="Chart" className="single-stock-card-header"/>
              <Card.Content className="stockpal-card-content">
                {stockChartContent}
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid>
      </section>
    );
  }
}

export default connect()(StockChart)

