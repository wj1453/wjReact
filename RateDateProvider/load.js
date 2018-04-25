import md5 from 'md5';

import makeApiRequest from '../utils/makeApiRequest';
import csrfMatches from '../utils/csrfMatches';
import actionTypes from './types';

const {
  FETCH_DEPTH_DATA,
  FETCH_TRADES_DATA,
  FETCH_USER_TRADES_DATA,
  FETCH_OPEN_ORDERS_DATA,
  FETCH_TRADE_ORDERS_DATA,
  FETCH_FAVORITES_DATA,
  FETCH_CNYUSD_RATE_DATA,
  FETCH_DEPTH_DATA_ERROR,
  FETCH_TRADES_DATA_ERROR,
  FETCH_USER_TRADES_DATA_ERROR,
  FETCH_OPEN_ORDERS_ERROR,
  FETCH_TRADE_ORDERS_ERROR,
  FETCH_FAVORITES_DATA_ERROR,
  FETCH_CNYUSD_RATE_DATE_ERROR,
  SET_PRODUCTS,
  SET_EXCHANGE_INFO,
  SET_DEPTH_DATA,
  SET_TRADES_DATA,
  SET_USER_TRADES_DATA,
  SET_OPEN_ORDERS_DATA,
  SET_TRADE_ORDERS_DATA,
  SET_FAVORITES_DATA,
  SET_LOCALE_DATA,
  SET_NEWS_DATA,
  SET_CNYUSD_RATE_DATA,
  SET_TOUSDT_RATE_DATA,
  SET_MARKETS_DATA,
  CLEAR_DEPTH_DATA,
  CLEAR_TRADES_DATA,
  CLEAR_USER_TRADES_DATA,
} = actionTypes;

const FETCH_RETRY_AFTER = 3000;

const DEPTH_API_PATH = '/api/v1/depth?symbol=';
const TRADES_API_PATH = '/api/v1/aggTrades?limit=80&symbol=';
const OPEN_ORDERS_API_PATH = '/exchange/private/openOrders';
const TRADE_ORDERS_API_PATH = '/exchange/private/tradeOrders';
const FAVORITES_API_PATH = '/exchange/private/portfolios';
const USER_TRADES_API_PATH = '/exchange/private/userTrades';
const CNYUSD_RATE_API_PATH = '/exchange/public/cnyusd';

export const setProducts = data => dispatch =>
  dispatch({ type: SET_PRODUCTS, data });

export const setExchangeInfo = data => dispatch =>
  dispatch({ type: SET_EXCHANGE_INFO, data });

export const setDepthData = (symbol, data) => dispatch =>
  dispatch({ type: SET_DEPTH_DATA, symbol, data });

export const setTradesData = (symbol, data) => dispatch =>
  dispatch({ type: SET_TRADES_DATA, symbol, data });

export const setUserTradesData = (symbol, data) => dispatch =>
  dispatch({ type: SET_USER_TRADES_DATA, symbol, data });

export const setOpenOrdersData = data => dispatch =>
  dispatch({ type: SET_OPEN_ORDERS_DATA, data });

export const setTradeOrdersData = data => dispatch =>
  dispatch({ type: SET_TRADE_ORDERS_DATA, data });

export const setFavoritesData = data => dispatch =>
  dispatch({ type: SET_FAVORITES_DATA, data });

export const fetchDepthData = symbol => async dispatch => {
  dispatch({ type: FETCH_DEPTH_DATA, symbol });
  try {
    const depth = await makeApiRequest(DEPTH_API_PATH + symbol);
    dispatch(setDepthData(symbol, depth));
  } catch (error) {
    dispatch({ type: FETCH_DEPTH_DATA_ERROR, error });
    // try again
    setTimeout(() => {
      dispatch(fetchDepthData(symbol));
    }, FETCH_RETRY_AFTER);
  }
};

export const fetchTradesData = symbol => async dispatch => {
  dispatch({ type: FETCH_TRADES_DATA, symbol });
  try {
    const depth = await makeApiRequest(TRADES_API_PATH + symbol);
    dispatch(setTradesData(symbol, depth));
  } catch (error) {
    dispatch({ type: FETCH_TRADES_DATA_ERROR, error });
    // try again
    setTimeout(() => {
      dispatch(fetchDepthData(symbol));
    }, FETCH_RETRY_AFTER);
  }
};

export const fetchUserTradesData = postData => async dispatch => {
  dispatch({ type: FETCH_USER_TRADES_DATA, postData });
  try {
    const params = new URLSearchParams();
    Object.keys(postData).forEach((key) => {
      params.set(key, postData[key]);
    });

    const userTrades = await makeApiRequest(USER_TRADES_API_PATH, null, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        csrftoken: md5(csrfMatches()[1]),
        clienttype: 'web',
        lang: 'en',
      },
      body: params,
    });
    dispatch(setUserTradesData(postData.symbol, userTrades));
  } catch (error) {
    dispatch({ type: FETCH_USER_TRADES_DATA_ERROR, error });
    // try again
    setTimeout(() => {
      dispatch(fetchUserTradesData(postData));
    }, FETCH_RETRY_AFTER);
  }
};

export const fetchOpenOrders = () => async dispatch => {
  dispatch({ type: FETCH_OPEN_ORDERS_DATA });
  try {
    const openOrders = await makeApiRequest(OPEN_ORDERS_API_PATH, null, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        csrftoken: md5(csrfMatches()[1]),
        clienttype: 'web',
        lang: 'en',
      },
    });
    dispatch(setOpenOrdersData(openOrders));
  } catch (error) {
    dispatch({ type: FETCH_OPEN_ORDERS_ERROR, error });
  }
};

export const fetchTradeOrders = postData => async dispatch => {
  dispatch({ type: FETCH_TRADE_ORDERS_DATA });
  try {
    const params = new URLSearchParams();
    Object.keys(postData).forEach((key) => {
      params.set(key, postData[key]);
    });
    const tradeOrders = await makeApiRequest(TRADE_ORDERS_API_PATH, null, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        csrftoken: md5(csrfMatches()[1]),
        clienttype: 'web',
        lang: 'en',
      },
      body: params,
    });
    dispatch(setTradeOrdersData(tradeOrders));
  } catch (error) {
    dispatch({ type: FETCH_TRADE_ORDERS_ERROR, error });
  }
};

export const fetchFavoritesData = () => async dispatch => {
  dispatch({ type: FETCH_FAVORITES_DATA });
  try {
    // TODO: move to one place
    // extract csrftoken from cookie to use in header.
    const csrfmatches = document.cookie.match(/CSRFToken=([a-z0-9]+)/i);
    if (!csrfmatches || !csrfmatches.length) throw new Error('Not logged in');

    const favorites = await makeApiRequest(FAVORITES_API_PATH, null, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        csrftoken: md5(csrfmatches[1]),
        clienttype: 'web',
        lang: 'en',
      },
    });
    dispatch(setFavoritesData(favorites));
  } catch (error) {
    dispatch({ type: FETCH_FAVORITES_DATA_ERROR, error });
  }
};

export const fetchCnyUsdRate = () => async dispatch => {
  dispatch({ type: FETCH_CNYUSD_RATE_DATA });
  try {
    const rate = await makeApiRequest(CNYUSD_RATE_API_PATH, null, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        clienttype: 'web',
        lang: 'en',
      },
    });
    dispatch(setCnyusdRate(rate));
  } catch (error) {
    dispatch({ type: FETCH_CNYUSD_RATE_DATA_ERROR, error });
  }
};

export const setCnyusdRate = (data) => dispatch =>
  dispatch({ type: SET_CNYUSD_RATE_DATA, data });

export const setToUsdtRate = (data) => dispatch =>
  dispatch({ type: SET_TOUSDT_RATE_DATA, data });
  
export const setMarketsData = (data) => dispatch =>
  dispatch({ type: SET_MARKETS_DATA, data });

export const setLocaleData = (locale, data) => dispatch =>
  dispatch({ type: SET_LOCALE_DATA, locale, data: Object.freeze(data) });

export const setNewsData = (locale, data) => dispatch =>
  dispatch({ type: SET_NEWS_DATA, locale, data });

export const clearDepthData = symbol => dispatch =>
  dispatch({ type: CLEAR_DEPTH_DATA, symbol });

export const clearTradesData = symbol => dispatch =>
  dispatch({ type: CLEAR_TRADES_DATA, symbol });

export const clearUserTradesData = symbol => dispatch =>
  dispatch({ type: CLEAR_USER_TRADES_DATA, symbol });
