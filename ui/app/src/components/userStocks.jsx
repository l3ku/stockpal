import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Icon, Label, Menu, Table, Loader, Dimmer, Dropdown, Button } from 'semantic-ui-react';
import { fetchUserStocks, deleteUserStock } from '../actions/stockActions';
import { getStockTypeDescription } from '../utils/helpers';
import Pagination from './table/pagination';

class UserStocks extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(fetchUserStocks());
  }

  render() {
    const {items, success, isLoaded, error, userStockSymbols, isLoggedIn } = this.props;
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
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Symbol</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Enabled</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items && items.map(item => {
              const { symbol, name, is_enabled } = item;
              const type = item.type.toLowerCase();
              const stockTypeDescription = getStockTypeDescription(type);
              return (
                <Table.Row key={item.symbol}>
                  <Table.Cell width={2}>
                    <a href='#' onClick={this.props.showStockFunc} data-stock-symbol={symbol}>{symbol}</a>
                  </Table.Cell>
                  <Table.Cell width={6}>
                    {name}
                  </Table.Cell>
                  <Table.Cell width={4}>
                    {stockTypeDescription ? stockTypeDescription : type}
                  </Table.Cell>
                  <Table.Cell width={1} className={is_enabled ? 'positive stock-is-enabled' : 'error stock-not-enabled'}>
                    {is_enabled ? 'Yes' : 'No'}
                  </Table.Cell>
                  <Table.Cell width={1}>
                    <Button negative onClick={() => window.confirm(`Are you sure you want to remove "${symbol}"?`) && this.props.dispatch(deleteUserStock(symbol))}>Remove</Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>

          <Table.Footer>
            <Pagination namespace="USER_STOCKS" />
          </Table.Footer>
        </Table>
      );
    }
  }
}

const mapStateToProps = state => {
  const namespace = 'USER_STOCKS';
  const content = state.table[namespace].content;
  const pagination = state.table[namespace].pagination;

  return {
    items: content.items.slice(content.showItemsStart, content.showItemsEnd),
    selectedItems: content.selectedItems,
    success: content.success,
    error: content.error,
    isLoaded: content.isLoaded,
    isLoggedIn: state.auth.isLoggedIn,
    userStockSymbols: state.table['USER_STOCKS'].content.items.map(item => item.symbol),
  }
};

export default connect(mapStateToProps)(UserStocks);
