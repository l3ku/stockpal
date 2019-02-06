import React, { Component } from 'react';
import { Icon, Label, Menu, Table, Loader, Dimmer } from 'semantic-ui-react';
import API from './../utils/api';

export class AllStocks extends Component {
  // Refers to the common issue type (AD - ADR).
  // See https://github.com/iexg/IEX-API/issues/264 for an explanation.
  getStockTypeDescriptions() {
    return {
      'ad': 'American Depository Receipt',
      're': 'Real Estate Investment Trust',
      'ce': 'Closed end fund',
      'si': 'Secondary Issue',
      'lp': 'Limited Partnerships',
      'cs': 'Common Stock',
      'et': 'Exchange Traded Fund',
      'crypto': 'Cryptocurrency',
      'ps': 'Preferred Stock'
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      itemsPerPage: 50,
      currentPage: 1,
      totalPages: 1,
      showMaxPages: 10
    };
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

  changePage = (evt) => {
    var page = parseInt(evt.target.getAttribute('data-page'));

    // Do nothing on current page click
    if ( page === this.state.currentPage ) {
      return;
    } else {
      this.setState({currentPage: page});
    }
  }

  render() {
    const { error, isLoaded, items, itemsPerPage, currentPage, totalPages, showMaxPages } = this.state;

    if (error) {
        return 'Error: ' + error;
    } else if (!isLoaded) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader />
          </Dimmer>
        </div>
      );
    } else {
      // The index of the first stock to show. Should be adjusted according to the current page.
      const begin = (this.state.currentPage - 1) * this.state.itemsPerPage;
      // The index of the last stock to show. Should be either begin + amount of items or the last item.
      const end = Math.min(begin + this.state.itemsPerPage + 1, this.state.items.length);
      const itemsSliced = items.slice(begin, end);
      const paginationStart = Math.max(this.state.currentPage-Math.floor(this.state.showMaxPages/2, 1), 0) + 1;
      const paginationEnd = Math.min(this.state.showMaxPages, paginationStart + this.state.showMaxPages);
      const paginationArray = [...Array(paginationEnd-paginationStart)]
      const stockTypeDescriptions = this.getStockTypeDescriptions()
      console.log(paginationStart);
      console.log(paginationEnd);
      return(
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
                    {item.symbol}
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
                  <Menu.Item as='a' disabled={currentPage === 1} icon>
                    <Icon name='chevron left' />
                  </Menu.Item>
                  {paginationArray.map((page, index) => {
                    return (
                      <Menu.Item key={paginationStart+index} disabled={currentPage === paginationStart+index} data-page={paginationStart+index} active={currentPage === paginationStart+index+1} as='a' onClick={this.changePage}>
                        {paginationStart+index}
                      </Menu.Item>
                    );
                  })}
                  <Menu.Item as='a' icon>
                    <Icon name='chevron right' disabled={currentPage === totalPages} />
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
