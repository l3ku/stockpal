import React, { Component } from 'react';
import { Icon, Label, Menu, Table, Loader, Dimmer } from 'semantic-ui-react';
import API from './../utils/api';

export class GainerStocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };
  }

  componentDidMount() {
    API.getGainerStocks(
      (result) => {
        this.setState({
          isLoaded: true,
          items: result.data
        });
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error: error
        });
      });
  }

  render() {
    const { error, isLoaded, items } = this.state;
    if (error || items.length < 0) {
      return (
        <div>Error: {error.message}</div>
      );
    } else if (!isLoaded) {
      return (
        <div>
          <Dimmer active inverted>
            <Loader />
          </Dimmer>
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
          {items && items.map(item => (
            <Table.Row key={item.symbol}>
              <Table.Cell>
                {item.companyName}
              </Table.Cell>
              <Table.Cell>
                {item.symbol}
              </Table.Cell>
              <Table.Cell className={item.change < 0 ? 'change-negative' : 'change-positive'}>
                {item.change > 0 ? '+' + item.change : item.change}
              </Table.Cell>
              <Table.Cell>
                {item.low}
              </Table.Cell>
              <Table.Cell>
                {item.high}
              </Table.Cell>
            </Table.Row>
          ))}
          </Table.Body>
        </Table>
      );
    }
  }
}
