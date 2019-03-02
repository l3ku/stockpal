import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Icon, Label, Menu, Table, Loader, Dimmer, Dropdown } from 'semantic-ui-react';
import { fetchAllStocks } from '../actions/stockActions';
import API from './../utils/api';

class AllStocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      itemsPerPage: 50,
      currentPage: 1,
      totalPages: 0,
      showPageRange: 10
    };
    // Bind custom functions to the class instance
    this.changePage = this.changePage.bind(this);
    this.incrementPage = this.incrementPage.bind(this);
    this.decrementPage = this.decrementPage.bind(this);
    this.changeItemsPerPage = this.changeItemsPerPage.bind(this);
  }

  componentDidMount() {
    this.props.fetchAllStocks();
  }

  componentWillReceiveProps(nextProps) {
    if ( nextProps.success && nextProps.items ) {
      this.setState({
        isLoaded: true,
        totalPages: Math.ceil(nextProps.items.length / this.state.itemsPerPage)
      });
    }
  }

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

  changePage(evt) {
    const page = parseInt(evt.currentTarget.getAttribute('data-page'));

    // Do nothing on current page click
    if ( page !== this.state.currentPage ) {
      this.setState({currentPage: page});
    }
  }

  changeItemsPerPage(evt) {
    const itemsPerPage = parseInt(evt.currentTarget.getAttribute('data-items-per-page'));
    if ( itemsPerPage !== this.state.itemsPerPage ) {

      // We need to ensure that if the maximum number of pages changes, we need to go back to
      // to the last page if we are above the limit. E.g. on last page when 50 items/page, and
      // changes to 300/page => out of range on pages.
      var currentPage = this.state.currentPage;
      const newTotalPages = Math.ceil(this.props.items.length / itemsPerPage);
      if ( currentPage > newTotalPages ) {
        currentPage = newTotalPages;
      }
      this.setState({
        itemsPerPage: itemsPerPage,
        totalPages: newTotalPages,
        currentPage: currentPage
      });
    }
  }

  incrementPage(evt) {
    if ( this.state.currentPage < this.state.totalPages ) {
      this.setState({currentPage: this.state.currentPage + 1});
    }
  }

  decrementPage(evt) {
    if ( this.state.currentPage > 1 ) {
      this.setState({currentPage: this.state.currentPage - 1});
    }
  }

  render() {
    const { error, itemsPerPage, isLoaded, currentPage, totalPages, showPageRange } = this.state;
    const { items, success } = this.props;

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
      const { currentPage, itemsPerPage, showPageRange } = this.state;
      // The index of the first stock to show. Should be adjusted according to the current page.
      const begin = (currentPage-1) * itemsPerPage;
      // The index of the last stock to show. Should be either begin + amount of items or the last item.
      const end = Math.min(begin+itemsPerPage, items.length-1);
      const itemsSliced = items.slice(begin, end);
      const paginationStart = Math.min(Math.max(currentPage-Math.floor(showPageRange/2), 0)+1, totalPages-showPageRange+1);
      const paginationEnd = Math.min(paginationStart+showPageRange-1, totalPages);
      const paginationArray = [...Array(paginationEnd-paginationStart+1)];
      const stockTypeDescriptions = this.getStockTypeDescriptions();

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
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {itemsSliced && itemsSliced.map(item => {
              return (
                <Table.Row key={item.symbol}>
                  <Table.Cell>
                    <a href='#' onClick={this.props.showStockFunc} data-stock-symbol={item.symbol}>{item.symbol}</a>
                  </Table.Cell>
                  <Table.Cell>
                    {item.name}
                  </Table.Cell>
                  <Table.Cell>
                    {stockTypeDescriptions[item.type.toLowerCase()] ? stockTypeDescriptions[item.type.toLowerCase()]: item.type}
                  </Table.Cell>
                  <Table.Cell className={item.isEnabled ? 'stock-is-enabled' : 'stock-not-enabled'}>
                    {item.isEnabled ? 'Yes' : 'No'}
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>

          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan='3'>
                <Menu floated='right' pagination>
                  <Menu.Item key={1} data-page={1} disabled={totalPages === 0 || currentPage === 1} as='a' onClick={this.changePage}>
                    <Icon name='angle double left' />
                  </Menu.Item>
                  <Menu.Item as='a' disabled={totalPages === 0 || currentPage === 1} onClick={this.decrementPage} icon>
                    <Icon name='chevron left' />
                  </Menu.Item>
                  {totalPages > 0 && paginationArray.map((page, index) => {
                    return (
                      <Menu.Item key={paginationStart+index} data-page={paginationStart+index} active={currentPage === paginationStart+index} as='a' onClick={this.changePage}>
                        {paginationStart+index}
                      </Menu.Item>
                    );
                  })}
                  <Menu.Item as='a' disabled={totalPages === 0 || currentPage === totalPages} onClick={this.incrementPage} icon>
                    <Icon name='chevron right' />
                  </Menu.Item>
                  <Menu.Item data-page={totalPages} disabled={totalPages === 0 || currentPage === totalPages} as='a' onClick={this.changePage}>
                    <Icon name='angle double right' />
                  </Menu.Item>
                   <Dropdown item text='Show items'>
                    <Dropdown.Menu>
                      {itemsPerPageOptions.map(option => {
                        return (
                          <Dropdown.Item key={option} active={itemsPerPage === option} onClick={this.changeItemsPerPage} data-items-per-page={option}>{option}</Dropdown.Item>
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
  isLoaded: true
})

export default connect(mapStateToProps, { fetchAllStocks })(AllStocks);
