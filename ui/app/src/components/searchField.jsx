import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Icon, Button } from 'semantic-ui-react';
import { searchItems } from '../actions/tableActions';

class SearchField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      searchTimeout: null
    };
  }

  clearSearchString = () => {
    this.setState({
      inputValue: ''
    });
    this.props.dispatch(searchItems('', this.props.namespace));
  }

  callSearchHandler = (evt) => {
    const searchString = evt.target.value;
    // Clear previous timeout if set to avoid multiple search calls
    if ( this.state.searchTimeout ) {
      clearTimeout(this.state.searchTimeout);
    }
    this.setState({
      inputValue: searchString,
      searchTimeout: setTimeout(() => this.props.dispatch(searchItems(searchString, this.props.namespace)), 1500)
    });
  }

  render() {
    return(
      <div className="search-wrapper">
        <input className="search-field" placeholder="Search" value={this.state.inputValue} onChange={this.callSearchHandler}/>
        <Icon name='search' size='small'/>
      </div>
    );
  }
}

export default connect()(SearchField);