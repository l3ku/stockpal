import React, {Component} from 'react';
import API from './../utils/api';
import ReactEcharts from 'echarts-for-react';

export class StockChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stockSymbol: props.stockSymbol,
      isLoaded: false,
      stockChartData: [],
      error: null,
    };
    this.getOption = this.getOption.bind(this);
  }

  componentDidMount() {
    API.getStockChart(
      (result) => {
        this.setState({
          isLoaded: true,
          stockChartData: result.data
        });
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error: error
        });
      });
    }

    getOption() {
      return {
        'title': {
          'text': this.state.stockSymbol
        }
      };
    }

    render() {
      return(
        <ReactEcharts
          option={this.getOption()}
        />
      );
    }
}
