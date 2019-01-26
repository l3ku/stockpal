import React, { Component } from 'react';
import { Icon, Label, Menu, Table, Loader, Dimmer } from 'semantic-ui-react';

export class MostActiveStocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: []
    };
  }

  componentDidMount() {
    fetch('/api/v1/mostactive')
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
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
        <Table className="most-active-table" celled>
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
          {items.map(item => (
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
