import React, {Component} from 'react';
import { connect } from 'react-redux';
import ReactEcharts from 'echarts-for-react';
import {Icon, Card} from 'semantic-ui-react';
import { getStockTypeDescription } from '../utils/helpers';

class StockChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stockInfoData: [],
      stockInfoIsLoaded: false,
      stockChartData: [],
      stockChartIsLoaded: false,
      error: null,
      interval: '5y'
    };
  }

  componentDidMount() {
    this.fetchStockInfo();
    this.fetchStockChart();
  }

  fetchStockInfo = () => {
    // We should show the info of the stock along with the chart
    fetch('/api/v1/stock/' + encodeURIComponent(this.props.stockSymbol))
      .then(res => res.json())
      .then(
        (res) => {
          this.setState({
            stockInfoIsLoaded: true,
            stockInfoData: res.data[0]
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

  render() {
    if ( !(this.state.stockInfoIsLoaded && this.state.stockChartIsLoaded) ) {
      return 'Loading...';
    }
    const stockInfo = this.state.stockInfoData;

    // Show an indication in case of an error
    if ( this.state.error ) {
      return 'Error: ' + this.state.error;
    }

    // Show no results found in case of an empty result
    if ( !stockInfo ) {
      return 'Sorry, no results were found...';
    }

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
    const type = stockInfo.type.toLowerCase();
    const stockTypeDescription = getStockTypeDescription(type);

    return (
      <section className="single-stock">
        <div className="single-stock-back-icon-wrapper">
          <a href="#" onClick={this.props.backButtonClickHandler}>
            <Icon name='arrow left' size='large'/>Back
          </a>
        </div>
        <Card className="single-stock-card">
          <Card.Content header={stockInfo.name} />
          <Card.Content>
            <div className="single-stock-info-wrapper">
                <div className="single-stock-info single-stock-symbol">
                  <div><strong>Symbol:</strong> {stockInfo.symbol}</div>
                </div>
                <div className="single-stock-info single-stock-type">
                  <div><strong>Type:</strong> {stockTypeDescription ? stockTypeDescription : type}</div>
                </div>
                <div className="single-stock-info single-stock-is-enabled">
                  <div><strong>Is enabled:</strong> {stockInfo.is_enabled ? 'Yes' : 'No'}</div>
                </div>

              </div>
              <div className='stock-chart-interval-options'>
                {intervalOptions.map(option => {
                  var className = 'stock-chart-interval-option';
                  className += this.state.interval === option.name ? ' selected' : '';
                  return (
                    <a key={option.name} href="#" className={className} onClick={() => this.changeInterval(option.name)}>{option.name}</a>
                  );
                })}
              </div>
            <ReactEcharts
              option={this.getOption()}
            />
          </Card.Content>
        </Card>
      </section>
    );
  }
}

export default connect()(StockChart)

