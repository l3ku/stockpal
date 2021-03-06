import {
  REQUEST_ITEMS,
  RECEIVE_ITEMS,
  REQUEST_ITEMS_ERROR,
  RECEIVE_ITEMS_ERROR,
  CHANGE_PAGE,
  CHANGE_ITEMS_PER_PAGE,
  TOGGLE_SELECTED_ITEMS,
  RESET_SELECTED_ITEMS,
  RECEIVE_ACTION_ON_ITEMS,
  SEARCH_ITEMS
} from '../actions/types';

const defaultState = {
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 50,
    showPageRange: 10,
  },
  content: {
    items: [],
    showItems: [],
    showItemsStart: 0,
    showItemsEnd: 0,
    selectedItems: [],
    success: null,
    isLoaded: false,
    error: null,
    isRefreshing: false,
    searchString: null,
    searchResults: [],
  }
};
const initialState = {
  'ALL_STOCKS': defaultState,
  'GAINER_STOCKS': defaultState,
  'USER_STOCKS': defaultState
};


export default function(state=initialState, action) {
  const namespace = action.namespace;
  if ( namespace !== undefined && state[namespace] !== undefined ) {
    const namespacedState = state[namespace];
    const pagination = namespacedState.pagination;
    const content = namespacedState.content;
    var newState = state;
    var begin, end;

    switch ( action.type ) {
      case SEARCH_ITEMS:
        const searchString = action.searchString;
        if ( searchString !== content.searchString ) {
          var searchResults = [];
          if ( searchString.trim() === "" ) {
            searchResults = [...content.items.keys()];
          } else {
            content.items.forEach((item, index) => {
              Object.keys(item).forEach(key => {
                if ( typeof item[key] === 'string' && item[key].toLowerCase().includes(searchString) && !searchResults.includes(index) ) {
                  searchResults.push(index);
                }
              });
            });
          }

          var currentPage = pagination.currentPage;
          var newTotalPages = Math.ceil(searchResults.length / pagination.itemsPerPage);
          newTotalPages = newTotalPages === 0 ? 1 : newTotalPages;
          if ( currentPage > newTotalPages ) {
            currentPage = newTotalPages;
          }
          const begin = (currentPage-1) * pagination.itemsPerPage;
          const end = Math.min(begin+pagination.itemsPerPage, searchResults.length);
          newState[namespace] = {
            ...namespacedState,
            pagination: {
              ...pagination,
              totalPages: newTotalPages,
              currentPage: currentPage,

            },
            content: {
              ...content,
              searchString: searchString,
              showItems: searchResults,
              showItemsStart: begin,
              showItemsEnd: end
            }
          };
          return JSON.parse(JSON.stringify(newState));
        }
        return state;

      case REQUEST_ITEMS:
        if ( action.refresh ) {
          newState[namespace] = {
            ...namespacedState,
            content: {
              ...content,
              isRefreshing: true
            }
          }
          return JSON.parse(JSON.stringify(newState));
        }
        return state;

      case RECEIVE_ITEMS:
        begin = (pagination.currentPage-1) * pagination.itemsPerPage;
        end = Math.min(begin+pagination.itemsPerPage, action.items.length);
        newState[namespace] = {
          ...namespacedState,
          pagination: {
            ...pagination,
            totalPages: Math.ceil(action.items.length / pagination.itemsPerPage),
          },
          content: {
            ...content,
            success: true,
            isLoaded: true,
            items: action.items,
            showItems: [...action.items.keys()],
            showItemsStart: begin,
            showItemsEnd: end,
            isRefreshing: false
          }
        };
        return JSON.parse(JSON.stringify(newState)); // Hack for returning deep copy of object

      case RECEIVE_ACTION_ON_ITEMS:
        if ( action.action === 'delete' ) {
          newState[namespace] = {
            ...namespacedState,
            content: {
              ...content,
              success: true,
              items: content.items.filter(obj => obj.symbol !== action.data)
            }
          };
        } else {
          newState[namespace] = {
            ...namespacedState,
            content: {
              ...content,
              success: true,
              actionTargets: action.symbols
            }
          };
        }
        return JSON.parse(JSON.stringify(newState)); // Hack for returning deep copy of object

      case RESET_SELECTED_ITEMS:
        newState[namespace] = {
          ...namespacedState,
          content: {
            ...content,
            selectedItems: []
          }
        };
        return JSON.parse(JSON.stringify(newState)); // Hack for returning deep copy of object

      case TOGGLE_SELECTED_ITEMS:
        var newSelectedItems = content.selectedItems;
        action.symbols.forEach(symbol => {
          if ( newSelectedItems.find(item => item === symbol) !== undefined ) {
            newSelectedItems = newSelectedItems.filter(item => item !== symbol);
          } else {
            newSelectedItems.push(symbol);
          }
        });
        newState[namespace] = {
          ...namespacedState,
          content: {
            ...content,
            selectedItems: newSelectedItems
          }
        };
        return JSON.parse(JSON.stringify(newState)); // Hack for returning deep copy of object

      case CHANGE_PAGE:
        begin = (action.page-1) * pagination.itemsPerPage;
        end = Math.min(begin+pagination.itemsPerPage, content.showItems.length);
        if ( action.page !== pagination.currentPage && action.page <= pagination.totalPages ) {
          newState[namespace] = {
            ...namespacedState,
            pagination: {
              ...pagination,
              currentPage: action.page
            },
            content: {
              ...content,
              showItemsStart: begin,
              showItemsEnd: end
            }
          };
        }
        return JSON.parse(JSON.stringify(newState)); // Hack for returning deep copy of object

      case CHANGE_ITEMS_PER_PAGE:
        if ( action.itemsPerPage !== pagination.itemsPerPage ) {
          // We need to ensure that if the maximum number of pages changes, we need to go back to
          // to the last page if we are above the limit. E.g. on last page when 50 items/page, and
          // changes to 300/page => out of range on pages.
          var currentPage = pagination.currentPage;
          var items = content.searchResults.length ? content.searchResults : content.showItems;
          var newTotalPages = Math.ceil(items.length / action.itemsPerPage);
          newTotalPages = newTotalPages === 0 ? 1 : newTotalPages;
          if ( currentPage > newTotalPages ) {
            currentPage = newTotalPages;
          }
          begin = (pagination.currentPage-1) * action.itemsPerPage;
          end = Math.min(begin+action.itemsPerPage, content.showItems.length);

          newState[namespace] = {
            ...namespacedState,
            pagination: {
              ...pagination,
              itemsPerPage: action.itemsPerPage,
              totalPages: newTotalPages,
              currentPage: currentPage === 0 ? 1 : 0
            },
            content: {
              ...content,
              showItemsStart: begin,
              showItemsEnd: end
            }
          };
        }
        return JSON.parse(JSON.stringify(newState)); // Hack for returning deep copy of object

      default:
        break;
    }
  }
  return state;
}