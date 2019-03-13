import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Icon, Label, Menu, Table, Loader, Dimmer, Dropdown, Button } from 'semantic-ui-react';
import { fetchStocks, addUserStock, changeStocksPerPage, changeStocksPage } from '../actions/stockActions';
import { getStockTypeDescription } from '../utils/helpers';

class AllStocks extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(fetchStocks());
  }

  render() {
    const { itemsPerPage, currentPage, totalPages, showPageRange, items, success, isLoaded, error, userStockSymbols, isLoggedIn } = this.props;
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
      // The index of the first stock to show. Should be adjusted according to the current page.
      const begin = (currentPage-1) * itemsPerPage;
      // The index of the last stock to show. Should be either begin + amount of items or the last item.
      const end = Math.min(begin+itemsPerPage, items.length);
      const itemsSliced = items.slice(begin, end);
      const paginationStart = Math.max(1, Math.max(currentPage-Math.floor(showPageRange/2), 0)+1, Math.min(totalPages-showPageRange+1, 1));
      const paginationEnd = Math.min(paginationStart+showPageRange-1, totalPages);
      const paginationArray = [...Array(paginationEnd-paginationStart+1)];

      // What items for page options show
      const itemsPerPageOptions = [50, 100, 150, 300];
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
            {itemsSliced && itemsSliced.map(item => {
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
                    <Button disabled={!isLoggedIn || userStockSymbols.indexOf(symbol) !== -1} onClick={() => this.props.dispatch(addUserStock(symbol))}>Add</Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>

          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='4'>
                <Menu floated='right' pagination>
                  <Menu.Item key={1} disabled={totalPages === 0 || currentPage === 1} as='a' onClick={() => this.props.dispatch(changeStocksPage(1))}>
                    <Icon name='angle double left' />
                  </Menu.Item>
                  <Menu.Item as='a' disabled={totalPages === 0 || currentPage === 1} onClick={() => this.props.dispatch(changeStocksPage(currentPage-1))} icon>
                    <Icon name='chevron left' />
                  </Menu.Item>
                  {totalPages > 0 && paginationArray.map((page, index) => {
                    return (
                      <Menu.Item key={paginationStart+index} active={currentPage === paginationStart+index} as='a' onClick={() => this.props.dispatch(changeStocksPage(paginationStart+index))}>
                        {paginationStart+index}
                      </Menu.Item>
                    );
                  })}
                  <Menu.Item as='a' disabled={totalPages === 0 || currentPage === totalPages} onClick={() => this.props.dispatch(changeStocksPage(currentPage+1))} icon>
                    <Icon name='chevron right' />
                  </Menu.Item>
                  <Menu.Item disabled={totalPages === 0 || currentPage === totalPages} as='a' onClick={() => this.props.dispatch(changeStocksPage(totalPages))}>
                    <Icon name='angle double right' />
                  </Menu.Item>
                   <Dropdown item text='Show items'>
                    <Dropdown.Menu>
                      {itemsPerPageOptions.map(option => {
                        return (
                          <Dropdown.Item key={option} active={itemsPerPage === option} onClick={() => this.props.dispatch(changeStocksPerPage(option))}>{option}</Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                </Menu>
                <small>Showing {itemsSliced.length} items, total {totalPages} pages</small>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      );
    }
  }
}

const mapStateToProps = state => ({
  items: state.stocks.items,
  success: state.stocks.success,
  error: state.stocks.error,
  isLoaded: state.stocks.isLoaded,
  isLoggedIn: state.auth.isLoggedIn,
  userStockSymbols: state.userStocks.items.map(item => item.symbol),
  totalPages: state.stocks.totalPages,
  itemsPerPage: state.stocks.itemsPerPage,
  showPageRange: state.stocks.showPageRange,
  currentPage: state.stocks.currentPage,
});

export default connect(mapStateToProps)(AllStocks);
