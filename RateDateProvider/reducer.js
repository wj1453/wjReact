/* global __DEV__ */

import actionTypes from '../actions/types';

const TRADES_LIMIT = 300;
const NONZERO_TEST = /[1-9]/;

export const initialState = {
  // login state
  isLoggedIn: false,
  locale: 'en',
  // generic state
  info: {}, // { info }
  localeData: {}, // {en | cn | etc => { i18n } }
  tickers: {}, // {s => { ticker }}
  books: {}, // {s => {bids | asks => [...]}}
  trades: {}, // {s => [...]}
  userTrades: {}, // {s => [...]}
  klineUpdates: {}, // {s => {interval => { most recent update }}}
  news: {}, // { news }
  orders: [], // [...]
  tradeOrders: [], // [...]
  favorites: [],
  cnyUsdRate: 0,
  toUsdtRate: {},
  markets: [],
};

// sets initial tickers
const handleSetProducts = (state, { data: { data } }) => {
  const newState = { ...state };
  newState.tickers = data.reduce((tickers, symbolInfo) => {
    // eslint-disable-next-line
    // convert the the symbol info from the `/product` api to ticker update format.
    const {
      low: l,
      close: c,
      high: h,
      open: o,
      volume: v,
      tradedMoney: q,
      symbol: s,
      tickSize: ts,
      minTrade: mt,
      quoteAsset: qa,
      baseAsset: ba,
      baseAssetName: bn,
    } = symbolInfo;
    tickers[s] = { s, l, c, h, o, q, v, qa, ba, bn, tickSize: ts, minTrade: mt }; // eslint-disable-line
    return tickers;
  }, {});
  return newState;
};

const handleClearTradesData = (state, { symbol }) => (
  { ...state, trades: { ...state.trades, [symbol]: [] } }
);

const handleClearUserTradesData = (state, { symbol }) => (
  { ...state, userTrades: { ...state.userTrades, [symbol]: [] } }
);

const handleClearDepthData = (state, { symbol }) => (
  { ...state, books: { ...state.books, [symbol]: {} } }
);

const handleUpdateTickers = (state, tickers) => {
  const newState = { ...state, tickers: { ...(state.tickers || {}) } };
  let updated = false;
  tickers.forEach(ticker => {
    delete ticker.e; // "24hrMiniTicker"
    const existing = state.tickers[ticker.s];
    if (!existing) {
      newState.tickers[ticker.s] = ticker;
      updated = true;
    // existing changed?
    } else if (Object.keys(ticker).some(key => ticker[key] !== existing[key])) {
      newState.tickers[ticker.s] = { ...state.tickers[ticker.s], ...(ticker || {}) };
      updated = true;
    }
  });
  return updated ? newState : state;
};

const handleUpdateTradesData = (state, { symbol, data }) => {
  const batchSize = data.length;
  if (!batchSize) return state;
  const newState = { ...state, trades: { ...(state.trades || {}) } };
  let list = newState.trades[symbol] = state.trades[symbol] || [];
  if (list && list.some(({ a }) => a === data[0].a)) {
    if (__DEV__) console.warn('Got trade behind last trade id. ignoring.', data[0].a);
    return state;
  }
  list = newState.trades[symbol] = data.reverse().concat(newState.trades[symbol]); // must be new
  if (list.length > TRADES_LIMIT) {
    list.length = TRADES_LIMIT; // chop one off the end
  }
  // used in MarketDataProvider#shouldComponentUpdate
  newState.trades[symbol].__lastBatchSize__ = batchSize;
  return newState; // trigger update
};

const handleUpdateUserTradesData = (state, { symbol, data }) => {
  const batchSize = data.data.length;
  if (!batchSize) return state;

  const userTrades = [];
  data.data.forEach((el) => {
    const singleTrade = {
      p: el.price,
      q: el.qty,
      s: el.symbol,
      T: el.time,
      a: el.tradeId,
    };
    userTrades.push(singleTrade);
  });

  userTrades.sort((a, b) => b.T - a.T); // sort by time, DESC

  const newState = { ...state, userTrades: { ...(state.userTrades || {}) } };
  let list = newState.userTrades[symbol] = state.userTrades[symbol] || [];
  if (list && list.some(({ a }) => a === userTrades[0].a)) {
    if (__DEV__) console.warn('Got trade behind last trade id. ignoring.', userTrades[0].a);
    return state;
  }

  list = newState.userTrades[symbol] =
  userTrades.concat(newState.userTrades[symbol]); // must be new

  if (list.length > TRADES_LIMIT) {
    list.length = TRADES_LIMIT; // chop one off the end
  }
  // used in UserDataProvider#shouldComponentUpdate
  newState.userTrades[symbol].__lastBatchSize__ = batchSize;
  return newState; // trigger update
};

const _makeOrder = ([price, total]) => [+price, total, +total]; // + parses floats, nums for sorting

const handleUpdateDepthData = (state, { symbol, data }, isStreamed) => {
  const prevBook = state.books[symbol] || {};
  // do not update before book is fetched
  if (isStreamed && !prevBook.lastUpdateId) {
    if (__DEV__) {
      console.warn('Got streamed update before the book was fetched. ignoring.',
        symbol, prevBook.lastUpdateId, data.lastUpdateId);
    }
    return state;
  // do not apply old updates
  } else if (data.lastUpdateId && prevBook.lastUpdateId &&
      data.lastUpdateId <= prevBook.lastUpdateId) {
    if (__DEV__) {
      console.warn('Got update behind book lastUpdateId. ignoring.',
        symbol, prevBook.lastUpdateId, data.lastUpdateId);
    }
    return state;
  }
  const newState = { ...state, books: { ...(state.books || {}) } };
  const book = newState.books[symbol] = { ...(state.books[symbol] || {}) };
  let updated = false;
  ['bids', 'asks'].forEach((type) => {
    let updatedSide = false;
    const newSide = data[type].reduce((side, pair) => {
      const [price, total] = pair;
      if (!NONZERO_TEST.test(total)) delete side[price];
      else side[price] = _makeOrder(pair);
      updatedSide = true;
      return side;
    }, { ...(book[type] || {}) });
    if (updatedSide) {
      book[type] = newSide;
      updated = true;
    }
  });
  if (book.lastUpdateId !== data.lastUpdateId) {
    book.lastUpdateId = data.lastUpdateId;
    updated = true;
  }
  return updated ? newState : state; // new object triggers render
};

const handleUpdateKlineData = (state, symbol, data) => ({
  ...state,
  klineUpdates: {
    ...state.klineUpdates,
    [symbol]: {
      [data.k.i]: data,
    },
  },
});

const handleSocketReceive = (state, { payload: { data } }) => {
  // tickers data is an array, others (trades, depth, kline) are not
  const ev = Array.isArray(data) ? data[0].e : data.e;
  switch (ev) {
    case '24hrMiniTicker':
      return handleUpdateTickers(state, data);
    case 'aggTrade':
      return handleUpdateTradesData(state, { symbol: data.s, data: [data] });
    case 'depthUpdate':
      return handleUpdateDepthData(state, {
        symbol: data.s,
        data: {
          asks: data.a,
          bids: data.b,
          lastUpdateId: data.u,
        },
      }, true);
    case 'kline':
      return handleUpdateKlineData(state, data.s, data);
    default:
      if (__DEV__) console.warn('unknown update received:', ev);
      return state;
  }
};

// applies a batch of updates
const handleSocketReceiveBatch = (state, { payload }) => {
  const tickers = [];
  const trades = { symbol: null, data: [] };
  const depths = { symbol: null, data: { asks: [], bids: [], lastUpdateId: null } };
  let hasTickers = false;
  let hasTrades = false;
  let hasDepths = false;
  payload.forEach(item => {
    const { data } = item;
    if (Array.isArray(data)) {
      tickers.push(...data);
      hasTickers = true;
    } else if (data.e === 'kline') {
      state = handleUpdateKlineData(state, data.s, data);
    } else if (data.e === 'aggTrade') {
      trades.symbol = data.s;
      trades.data.push(data);
      hasTrades = true;
    } else if (data.e === 'depthUpdate') {
      depths.symbol = data.s;
      depths.data.asks.push(...data.a);
      depths.data.bids.push(...data.b);
      depths.data.lastUpdateId = data.u;
      hasDepths = true;
    }
  });
  if (hasTickers) state = handleUpdateTickers(state, tickers);
  if (hasTrades) state = handleUpdateTradesData(state, trades);
  if (hasDepths) state = handleUpdateDepthData(state, depths);
  return state;
};

const handleUpdateLocaleData = (state, { locale, data }) => {
  const localeData = { ...state.localeData, [locale]: data };
  return { ...state, localeData, locale };
};

const handleUpdateNewsData = (state, { locale, data }) => {
  const news = { ...state.news, [locale]: data };
  return { ...state, news };
};

const handleSetOpenOrders = (state, { data }) => ({
  ...state, openOrders: [...data],
});

const handleSetTradeOrders = (state, { data }) => ({
  ...state, tradeOrders: [...data.data],
});

const handleSetFavoritesData = (state, { data }) => ({
  ...state, favorites: [...data.data],
});

const handleUpdateFavoritesData = (state, { data: { symbol } }) => {
  const newState = { ...state, favorites: [...state.favorites] };
  const index = state.favorites.indexOf(symbol);
  if (index > -1) {
    newState.favorites.splice(index, 1);
  } else {
    newState.favorites.push(symbol);
  }
  return newState;
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    // web socket actions
    case actionTypes.WEB_SOCKET_CONNECTED:
      return { ...state, socketConnected: true };
    case actionTypes.WEB_SOCKET_DISCONNECTED:
      return { ...state, socketConnected: false };
    case actionTypes.WEB_SOCKET_RECEIVED:
      return handleSocketReceive(state, action);
    case actionTypes.WEB_SOCKET_RECEIVED_BATCH:
      return handleSocketReceiveBatch(state, action);

    // depth streamer status
    case actionTypes.WEB_SOCKET_DEPTH_CONNECTED:
      return { ...state, depthSocketConnected: true };
    case actionTypes.WEB_SOCKET_DEPTH_DISCONNECTED:
      return { ...state, depthSocketConnected: false };


    // user actions
    case actionTypes.USER_STATE_LOGGED_IN:
      return { ...state, isLoggedIn: true };
    case actionTypes.USER_STATE_LOGGED_OUT:
      return { ...state, isLoggedIn: false };

    // clear data
    case actionTypes.CLEAR_DEPTH_DATA:
      return handleClearDepthData(state, action);
    case actionTypes.CLEAR_TRADES_DATA:
      return handleClearTradesData(state, action);
    case actionTypes.CLEAR_USER_TRADES_DATA:
      return handleClearUserTradesData(state, action);

    // set data
    case actionTypes.SET_PRODUCTS:
      return handleSetProducts(state, action);
    case actionTypes.SET_EXCHANGE_INFO:
      return { ...state, info: action.data };
    // clear and update depth and trades after fetching.
    case actionTypes.SET_DEPTH_DATA:
      state = handleClearDepthData(state, action);
      return handleUpdateDepthData(state, action);
    case actionTypes.SET_TRADES_DATA:
      state = handleClearTradesData(state, action);
      return handleUpdateTradesData(state, action);
    case actionTypes.SET_USER_TRADES_DATA:
      state = handleClearUserTradesData(state, action);
      return handleUpdateUserTradesData(state, action);
    case actionTypes.SET_OPEN_ORDERS_DATA:
      return handleSetOpenOrders(state, action);
    case actionTypes.SET_TRADE_ORDERS_DATA:
      return handleSetTradeOrders(state, action);
    case actionTypes.SET_FAVORITES_DATA:
      return handleSetFavoritesData(state, action);
    case actionTypes.HANDLE_FAVORITE_DATA:
      return handleUpdateFavoritesData(state, action);

    case actionTypes.SET_LOCALE_DATA:
      return handleUpdateLocaleData(state, action);
    case actionTypes.SET_NEWS_DATA:
      return handleUpdateNewsData(state, action);
    case actionTypes.SET_CNYUSD_RATE_DATA:
      return { ...state, cnyUsdRate: action.data.rate };
    case actionTypes.SET_TOUSDT_RATE_DATA:
      return { ...state, toUsdtRate: action.data };
      case actionTypes.SET_MARKETS_DATA:
      return { ...state, markets: [...action.data] };

    default:
      return state;
  }
};

export default reducer;
