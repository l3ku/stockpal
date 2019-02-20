/* eslint-disable */
import React, { Component } from 'react';
import { Icon, Label, Menu, Table, Loader, Dimmer } from 'semantic-ui-react';
import API from './../utils/api';

export class AllStocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      itemsPerPage: 50,
      currentPage: 1,
      totalPages: 0,
      showPageRange: 10
    };
    // Bind custom functions to the class instance
    this.changePage = this.changePage.bind(this);
    this.incrementPage = this.incrementPage.bind(this);
    this.decrementPage = this.decrementPage.bind(this);
  }
  componentDidMount() {
    API.getAllStocks(
      (result) => {
        if ( result.success ) {
          this.setState({
            isLoaded: true,
            items: result.data,
            totalPages: Math.ceil(result.data.length / this.state.itemsPerPage)
          });
        } else {
          this.setState({
            isLoaded: true,
            error: result.error
          });
        }
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error: error
        });
      });
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
    const page = parseInt(evt.target.getAttribute('data-page'));

    // Do nothing on current page click
    if ( page !== this.state.currentPage ) {
      this.setState({currentPage: page});
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
    const { error, isLoaded, items, itemsPerPage, currentPage, totalPages, showPageRange } = this.state;

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
      const begin = (this.state.currentPage - 1) * this.state.itemsPerPage;
      // The index of the last stock to show. Should be either begin + amount of items or the last item.
      const end = Math.min(begin + this.state.itemsPerPage + 1, this.state.items.length);
      const itemsSliced = items.slice(begin, end);
      const paginationStart = Math.min(Math.max(this.state.currentPage-Math.floor(this.state.showPageRange/2), 0) + 1, totalPages-this.state.showPageRange);
      const paginationEnd = Math.min(paginationStart+this.state.showPageRange, totalPages);
      const paginationArray = [...Array(paginationEnd-paginationStart)];
      const stockTypeDescriptions = this.getStockTypeDescriptions();

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
                </Menu>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      );
    }
  }
}
