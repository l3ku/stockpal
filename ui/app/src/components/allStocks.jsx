import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Label, Menu, Table, Loader, Dimmer, Dropdown, Checkbox } from 'semantic-ui-react';
import { fetchStocks, addUserStocks } from '../actions/stockActions';
import { toggleSelectedItems, resetSelectedItems } from '../actions/tableActions';
import { getStockTypeDescription } from '../utils/helpers';
import Pagination from './table/pagination';

class AllStocks extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(fetchStocks());
  }

  render() {
    const { selectedItems, items, success, isLoaded, error, userStockSymbols, isLoggedIn } = this.props;
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

      let selectionOption = (
        <a href="#" onClick={() => this.props.dispatch(toggleSelectedItems(items.map(item => item.symbol), 'ALL_STOCKS'))}>Select all</a>
      );
      if ( selectedItems.length > 0 ) {
        selectionOption = (
          <a href="#" onClick={() => this.props.dispatch(resetSelectedItems('ALL_STOCKS'))}>Remove selection</a>
        );
      }
      return (
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Symbol</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Enabled</Table.HeaderCell>
              <Table.HeaderCell>
              <Dropdown text='Actions'>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => this.props.dispatch(addUserStocks(selectedItems))} text='Add' disabled={!isLoggedIn || selectedItems.length === 0}/>
                </Dropdown.Menu>
              </Dropdown>
              {selectionOption}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {items && items.map(item => {
              const { symbol, name, is_enabled } = item;
              const type = item.type.toLowerCase();
              const stockTypeDescription = getStockTypeDescription(type);
              return (
                <Table.Row key={symbol}>
                  <Table.Cell width={3}>
                    <a href='#' onClick={this.props.showStockFunc} data-stock-symbol={item.symbol}>{item.symbol}</a>
                  </Table.Cell>
                  <Table.Cell width={6}>
                    {name}
                  </Table.Cell>
                  <Table.Cell width={4}>
                    {stockTypeDescription ? stockTypeDescription : type}
                  </Table.Cell>
                  <Table.Cell width={2} className={is_enabled ? 'positive stock-is-enabled' : 'error stock-not-enabled'}>
                    {is_enabled ? 'Yes' : 'No'}
                  </Table.Cell>
                  <Table.Cell width={1}>
                    <Checkbox disabled={!isLoggedIn || userStockSymbols.indexOf(symbol) !== -1} checked={selectedItems.indexOf(symbol) !== -1} onChange={() => this.props.dispatch(toggleSelectedItems([symbol], 'ALL_STOCKS'))}/>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>

          <Table.Footer>
            <Pagination namespace="ALL_STOCKS" />
          </Table.Footer>
        </Table>
      );
    }
  }
}

const mapStateToProps = state => {
  const namespace = 'ALL_STOCKS';
  const content = state.table[namespace].content;
  const pagination = state.table[namespace].pagination;
  const begin = (pagination.currentPage-1) * pagination.itemsPerPage;
  const end = Math.min(begin+pagination.itemsPerPage, content.items.length);

  return {
    items: content.items.slice(begin, end),
    selectedItems: content.selectedItems,
    success: content.success,
    error: content.error,
    isLoaded: content.isLoaded,
    isLoggedIn: state.auth.isLoggedIn,
    userStockSymbols: state.table['USER_STOCKS'].content.items.map(item => item.symbol),
  }
};

export default connect(mapStateToProps)(AllStocks);
