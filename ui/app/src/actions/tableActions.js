import * as types from './types';

export const requestItems = (namespace, refresh=false) => {
  return {
    type: types.REQUEST_ITEMS,
    namespace: namespace,
    refresh: refresh
  };
};

export const receiveItems = (data, namespace, refresh=false) => {
  return {
    type: types.RECEIVE_ITEMS,
    items: data,
    namespace: namespace,
    receivedAt: Date.now(),
    refresh: refresh
  };
};

export const requestItemsError = (error, namespace, refresh=false) => {
  return {
    type: types.REQUEST_ITEMS_ERROR,
    error: error,
    namespace: namespace,
    refresh: refresh
  };
};

export const receiveItemsError = (error, namespace) => {
  return {
    type: types.RECEIVE_ITEMS_ERROR,
    error: error,
    namespace: namespace
  };
};

export const changePage = (page, namespace) => {
  return {
    type: types.CHANGE_PAGE,
    page: page,
    namespace: namespace
  };
};

export const changeItemsPerPage = (itemsPerPage, namespace) => {
  return {
    type: types.CHANGE_ITEMS_PER_PAGE,
    itemsPerPage: itemsPerPage,
    namespace: namespace
  };
};

export const requestActionOnItems = (action, namespace) => {
  return {
    type: types.REQUEST_ACTION_ON_ITEMS,
    action: action,
    namespace: namespace
  };
};

export const receiveActionOnItems = (data, action, namespace) => {
  return {
    type: types.RECEIVE_ACTION_ON_ITEMS,
    data: data,
    action: action,
    namespace: namespace
  };
};

export const requestActionOnItemsError = (error, action, namespace) => {
  return {
    type: types.REQUEST_ACTION_ON_ITEMS_ERROR,
    error: error,
    action: action,
    namespace: namespace
  };
};

export const receiveActionOnItemsError = (error, action, namespace) => {
  return {
    type: types.RECEIVE_ACTION_ON_ITEMS_ERROR,
    error: error,
    action: action,
    namespace: namespace
  };
};

export const toggleSelectedItems = (symbols, namespace) => {
  return {
    type: types.TOGGLE_SELECTED_ITEMS,
    symbols: symbols,
    namespace: namespace
  };
};

export const resetSelectedItems = (namespace) => {
  return {
    type: types.RESET_SELECTED_ITEMS,
    namespace: namespace
  };
};