import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Label, Menu, Table, Loader, Dimmer, Dropdown } from 'semantic-ui-react';
import { fetchGainerStocks } from '../actions/stockActions';
import Pagination from './table/pagination';

class GainerStocks extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(fetchGainerStocks());
  }

  render() {
    const { items, success, isLoaded, error, userStockSymbols, isLoggedIn } = this.props;
    if (error) {
        return ( 'Error: ' + error );
    } else if (!isLoaded) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader />
          </Dimmer>
        </div>
      );
    } else if (isLoaded && items.length === 0) {
      return (
        <div>
          Sorry, no results...
        </div>
      );
    } else {
      return (
        <Table className="gainer-stocks-table" celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Symbol</Table.HeaderCell>
              <Table.HeaderCell>Change</Table.HeaderCell>
              <Table.HeaderCell>Low</Table.HeaderCell>
              <Table.HeaderCell>High</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
          {items && items.map(item => {
            const showStockFunc = this.props.showStockFunc;
            const { symbol, companyName, change, low, high } = item;
            return (
              <Table.Row key={symbol}>
                <Table.Cell>
                  <a href='#' onClick={showStockFunc} data-stock-symbol={symbol}>{companyName}</a>
                </Table.Cell>
                <Table.Cell>
                  <a href='#' onClick={this.props.showStockFunc} data-stock-symbol={symbol}>{symbol}</a>
                </Table.Cell>
                <Table.Cell className={change < 0 ? 'change-negative' : 'change-positive'}>
                  {change > 0 ? `+${change}` : change}
                </Table.Cell>
                <Table.Cell>
                  {low}
                </Table.Cell>
                <Table.Cell>
                  {high}
                </Table.Cell>
              </Table.Row>
            );
          })}
          </Table.Body>
          <Table.Footer>
            <Pagination namespace="GAINER_STOCKS"/>
          </Table.Footer>
        </Table>
      );
    }
  }
}

const mapStateToProps = state => {
  const namespace = 'GAINER_STOCKS';
  const content = state.table[namespace].content;
  const pagination = state.table[namespace].pagination;
  const begin = (pagination.currentPage-1) * pagination.itemsPerPage;
  const end = Math.min(begin+pagination.itemsPerPage, content.items.length);

  return {
    items: content.items.slice(begin, end),
    success: content.success,
    error: content.error,
    isLoaded: content.isLoaded,
    isLoggedIn: state.auth.isLoggedIn,
    userStockSymbols: state.table['USER_STOCKS'].content.items.map(item => item.symbol)
  }
};

export default connect(mapStateToProps)(GainerStocks);
