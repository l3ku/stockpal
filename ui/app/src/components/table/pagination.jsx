import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Menu, Table, Dropdown, Icon } from 'semantic-ui-react';
import { changePage, changeItemsPerPage } from '../../actions/tableActions';

class Pagination extends Component {
  constructor(props) {
    super(props);
    this.changePageFunc = this.changePageFunc.bind(this);
  }

  changePageFunc = (page) => {
    const namespace = this.props.namespace;
    this.props.dispatch(changePage(page, namespace));
  }

  render() {
    const { dispatch, currentPage, totalPages, itemsPerPage, showPageRange } = this.props;

    const paginationStart = Math.max(1, Math.max(currentPage-Math.floor(showPageRange/2), 0)+1, Math.min(totalPages-showPageRange+1, 1));
    const paginationEnd = Math.min(paginationStart+showPageRange-1, totalPages);
    const paginationArray = [...Array(paginationEnd-paginationStart+1)];

    // What items for page options show
      const itemsPerPageOptions = [50, 100, 150, 300];
    return (
      <Table.Row>
        <Table.HeaderCell colSpan='4'>
          <Menu floated='right' pagination>
            <Menu.Item key={1} disabled={totalPages === 0 || currentPage === 1} as='a' onClick={() => this.changePageFunc(1)}>
              <Icon name='angle double left' />
            </Menu.Item>
            <Menu.Item as='a' disabled={totalPages === 0 || currentPage === 1} onClick={() => this.changePageFunc(currentPage-1)} icon>
              <Icon name='chevron left' />
            </Menu.Item>
            {totalPages > 0 && paginationArray.map((page, index) => {
              return (
                <Menu.Item key={paginationStart+index} active={currentPage === paginationStart+index} as='a' onClick={() => this.changePageFunc(paginationStart+index)}>
                  {paginationStart+index}
                </Menu.Item>
              );
            })}
            <Menu.Item as='a' disabled={totalPages === 0 || currentPage === totalPages} onClick={() => this.changePageFunc(currentPage+1)} icon>
              <Icon name='chevron right' />
            </Menu.Item>
            <Menu.Item disabled={totalPages === 0 || currentPage === totalPages} as='a' onClick={() => this.changePageFunc(totalPages)}>
              <Icon name='angle double right' />
            </Menu.Item>
             <Dropdown item text='Show items'>
              <Dropdown.Menu>
                {itemsPerPageOptions.map(option => {
                  return (
                    <Dropdown.Item key={option} active={itemsPerPage === option} onClick={() => this.changePageFunc(option)}>{option}</Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </Menu>
          <small>Total {totalPages} pages</small>
        </Table.HeaderCell>
      </Table.Row>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const namespace = ownProps.namespace;
  const namespacedState = state.table[namespace];
  const pagination = namespacedState.pagination;
  return {
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    itemsPerPage: pagination.itemsPerPage,
    showPageRange: pagination.showPageRange,
    currentPage: pagination.currentPage
  };
};

export default connect(mapStateToProps)(Pagination);
