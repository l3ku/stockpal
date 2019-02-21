import React, {Component} from 'react';
import API from './../utils/api';
import ReactEcharts from 'echarts-for-react';
import {Icon, Card} from 'semantic-ui-react';

export class StockChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stockInfoData: [],
      stockInfoIsLoaded: false,
      stockChartData: [],
      stockChartIsLoaded: false,
      error: null,
    };
    this.getOption = this.getOption.bind(this);
  }

  // TODO: move this somewhere in utils because it is used multiple times
  getStockTypeDescriptions() {
    // Refers to the common issue type (AD - ADR).
    // See https://github.com/iexg/IEX-API/issues/264 for an explanation.
    return {
      ad: 'American Depository Receipt',
      re: 'Real Estate Investment Trust',
      ce: 'Closed end fund',
      si: 'Secondary Issue',
      lp: 'Limited Partnerships',
      cs: 'Common Stock',
      et: 'Exchange Traded Fund',
      crypto: 'Cryptocurrency',
      ps: 'Preferred Stock',
    };
  }

  componentDidMount() {
    // We should show the info of the stock along with the chart
    API.getStockInfo(
      this.props.stockSymbol,
      (result) => {
        console.log(result);
        this.setState({
          stockInfoIsLoaded: true,
          stockInfo: result.data[0]
        });
      },
      (error) => {
        this.setState({
          stockInfoIsLoaded: true,
          error: error
        });
      }
    );
    API.getStockChart(
      this.props.stockSymbol,
      (result) => {
        console.log(result);
        this.setState({
          stockChartIsLoaded: true,
          stockChartData: result.data
        });
      },
      (error) => {
        this.setState({
          stockChartIsLoaded: true,
          error: error
        });
      });
    }

    getOption() {
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
      const stockTypeDescriptions = this.getStockTypeDescriptions();
      const stockInfo = this.state.stockInfo;

      // Show an indication in case of an error
      if ( this.state.error ) {
        return 'Error: ' + this.state.error;
      }

      // Show no results found in case of an empty result
      if ( !stockInfo ) {
        return 'Sorry, no results were found...';
      }
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
                    <div><strong>Type:</strong> {stockTypeDescriptions[stockInfo.type.toLowerCase()] ? stockTypeDescriptions[stockInfo.type.toLowerCase()]: stockInfo.type}</div>
                    <small>TIP: common issue type</small>
                  </div>
                  <div className="single-stock-info single-stock-is-enabled">
                    <div><strong>Is enabled:</strong> {stockInfo.isEnabled ? 'Yes' : 'No'}</div>
                    <small>TIP: whether the symbol is enabled for trading on IEX</small>
                  </div>

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
