export default {
  // socket action types
  WEB_SOCKET_CONNECTED: 'WEB_SOCKET_CONNECTED',
  WEB_SOCKET_DISCONNECTED: 'WEB_SOCKET_DISCONNECTED',
  WEB_SOCKET_RECEIVED: 'WEB_SOCKET_RECEIVED',
  WEB_SOCKET_RECEIVED_BATCH: 'WEB_SOCKET_RECEIVED_BATCH',
  WEB_SOCKET_SUBSCRIBED: 'WEB_SOCKET_SUBSCRIBED',
  WEB_SOCKET_QUEUE: 'WEB_SOCKET_QUEUE',
  WEB_SOCKET_FLUSH: 'WEB_SOCKET_FLUSH',
  WEB_SOCKET_DISCONNECT: 'WEB_SOCKET_DISCONNECT',

  // depth streamer status
  WEB_SOCKET_DEPTH_DISCONNECTED: 'WEB_SOCKET_DEPTH_DISCONNECTED',
  WEB_SOCKET_DEPTH_CONNECTED: 'WEB_SOCKET_DEPTH_CONNECTED',

  // user login state
  USER_STATE_LOGGED_IN: 'USER_STATE_LOGGED_IN',
  USER_STATE_LOGGED_OUT: 'USER_STATE_LOGGED_OUT',

  // data action types (on first load)
  SET_PRODUCTS: 'SET_PRODUCTS',
  SET_EXCHANGE_INFO: 'SET_EXCHANGE_INFO',
  SET_LOCALE_DATA: 'SET_LOCALE_DATA',
  SET_NEWS_DATA: 'SET_NEWS_DATA',

  // market data
  FETCH_DEPTH_DATA: 'FETCH_DEPTH_DATA',
  FETCH_TRADES_DATA: 'FETCH_TRADES_DATA',
  FETCH_USER_TRADES_DATA: 'FETCH_USER_TRADES_DATA',
  FETCH_OPEN_ORDERS_DATA: 'FETCH_OPEN_ORDERS_DATA',
  FETCH_TRADE_ORDERS_DATA: 'FETCH_TRADE_ORDERS_DATA',
  FETCH_FAVORITES_DATA: 'FETCH_FAVORITES_DATA',
  FETCH_CNYUSD_RATE_DATA: 'FETCH_CNYUSD_RATE_DATA',
  FETCH_DEPTH_DATA_ERROR: 'FETCH_DEPTH_DATA_ERROR',
  FETCH_TRADES_DATA_ERROR: 'FETCH_TRADES_DATA_ERROR',
  FETCH_USER_TRADES_DATA_ERROR: 'FETCH_USER_TRADES_DATA_ERROR',
  FETCH_OPEN_ORDERS_ERROR: 'FETCH_OPEN_ORDERS_ERROR',
  FETCH_TRADE_ORDERS_ERROR: 'FETCH_TRADE_ORDERS_ERROR',
  FETCH_FAVORITES_DATA_ERROR: 'FETCH_FAVORITES_DATA_ERROR',
  FETCH_CNYUSD_RATE_DATE_ERROR: 'FETCH_CNYUSD_RATE_DATA_ERROR',
  SET_DEPTH_DATA: 'SET_DEPTH_DATA',
  SET_TRADES_DATA: 'SET_TRADES_DATA',
  SET_USER_TRADES_DATA: 'SET_USER_TRADES_DATA',
  SET_OPEN_ORDERS_DATA: 'SET_OPEN_ORDERS_DATA',
  SET_TRADE_ORDERS_DATA: 'SET_TRADE_ORDERS_DATA',
  SET_FAVORITES_DATA: 'SET_FAVORITES_DATA',
  SET_CNYUSD_RATE_DATA: 'SET_CNYUSD_RATE_DATA',
  SET_TOUSDT_RATE_DATA: 'SET_TOUSDT_RATE_DATA',
  SET_MARKETS_DATA: 'SET_MARKETS_DATA',

  // clear market data
  CLEAR_DEPTH_DATA: 'CLEAR_DEPTH_DATA',
  CLEAR_TRADES_DATA: 'CLEAR_TRADES_DATA',
  CLEAR_USER_TRADES_DATA: 'CLEAR_USER_TRADES_DATA',

  // order action types
  PLACE_ORDER_START: 'PLACE_ORDER',
  PLACE_ORDER_SUCCESS: 'PLACE_ORDER_SUCCESS',
  PLACE_ORDER_FAILED: 'PLACE_ORDER_FAILED',
  DELETE_ORDER_START: 'DELETE_ORDER_START',
  DELETE_ORDER_SUCCESS: 'DELETE_ORDER_SUCCESS',
  DELETE_ORDER_FAILED: 'DELETE_ORDER_FAILED',

  // favorites action types
  HANDLE_FAVORITE_DATA: 'HANDLE_FAVORITE_DATA',
  HANDLE_FAVORITE_DATA_SUCCESS: 'HANDLE_FAVORITE_DATA_SUCCESS',
  HANDLE_FAVORITE_DATA_FAILED: 'HANDLE_FAVORITE_DATA_FAILED',
};