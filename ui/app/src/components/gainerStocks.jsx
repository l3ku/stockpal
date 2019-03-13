import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Label, Menu, Table, Loader, Dimmer, Dropdown } from 'semantic-ui-react';
import { fetchGainerStocks, changeGainerStocksPerPage, changeGainerStocksPage } from '../actions/stockActions';

class GainerStocks extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(fetchGainerStocks());
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
            <Table.Row>
              <Table.HeaderCell colSpan='4'>
                <Menu floated='right' pagination>
                  <Menu.Item key={1} disabled={totalPages === 0 || currentPage === 1} as='a' onClick={() => this.props.dispatch(changeGainerStocksPage(1))}>
                    <Icon name='angle double left' />
                  </Menu.Item>
                  <Menu.Item as='a' disabled={totalPages === 0 || currentPage === 1} onClick={() => this.props.dispatch(changeGainerStocksPage(currentPage-1))} icon>
                    <Icon name='chevron left' />
                  </Menu.Item>
                  {totalPages > 0 && paginationArray.map((page, index) => {
                    return (
                      <Menu.Item key={paginationStart+index} active={currentPage === paginationStart+index} as='a' onClick={() => this.props.dispatch(changeGainerStocksPage(paginationStart+index))}>
                        {paginationStart+index}
                      </Menu.Item>
                    );
                  })}
                  <Menu.Item as='a' disabled={totalPages === 0 || currentPage === totalPages} onClick={() => this.props.dispatch(changeGainerStocksPage(currentPage+1))} icon>
                    <Icon name='chevron right' />
                  </Menu.Item>
                  <Menu.Item disabled={totalPages === 0 || currentPage === totalPages} as='a' onClick={() => this.props.dispatch(changeGainerStocksPage(totalPages))}>
                    <Icon name='angle double right' />
                  </Menu.Item>
                   <Dropdown item text='Show items'>
                    <Dropdown.Menu>
                      {itemsPerPageOptions.map(option => {
                        return (
                          <Dropdown.Item key={option} active={itemsPerPage === option} onClick={() => this.props.dispatch(changeGainerStocksPerPage(option))}>{option}</Dropdown.Item>
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
  items: state.gainerStocks.items,
  success: state.gainerStocks.success,
  error: state.gainerStocks.error,
  isLoaded: state.gainerStocks.isLoaded,
  isLoggedIn: state.auth.isLoggedIn,
  userStockSymbols: state.userStocks.items.map(item => item.symbol),
  totalPages: state.gainerStocks.totalPages,
  itemsPerPage: state.gainerStocks.itemsPerPage,
  showPageRange: state.gainerStocks.showPageRange,
  currentPage: state.gainerStocks.currentPage,
})

export default connect(mapStateToProps)(GainerStocks);
