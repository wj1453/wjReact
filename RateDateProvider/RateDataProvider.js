import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { fetchCnyUsdRate, setToUsdtRate, setMarketsData } from '../actions/load';

const mapStateToProps = ({ tickers }) => ({ tickers });
const mapDispatchToProps = { fetchCnyUsdRate, setToUsdtRate, setMarketsData };

@connect(mapStateToProps, mapDispatchToProps)
export default
class RateDataProvider extends Component {
  static propTypes = {
    tickers: PropTypes.object,
    fetchCnyUsdRate: PropTypes.func.isRequired,
    setToUsdtRate: PropTypes.func.isRequired,
    setMarketsData: PropTypes.func.isRequired,
  };

  static defaultProps = {
    tickers: {},
  }

  // client-side (component imported with `next/dynamic`)
  componentWillMount() {
    this._update();
  }

  shouldComponentUpdate(nextProps) {
    return (nextProps.tickers !== this.props.tickers);
  }

  componentDidUpdate() {
    this._update();
  }

  _getTickersInfo() {
    const { tickers } = this.props;
    const obj = {};
    const arr = [];
    Object.values(tickers).map((v) => {
      const { qa, s, c } = v;
      const ba = s.split(qa)[0];
      if (v.qa === 'USDT') {
        obj[ba] = c;
      }
      if (!arr.includes(qa)) {
        arr.push(qa);
      }
      return null;
    });
    obj.USDT = 1;
    return {
      markets: arr,
      toUsdRate: obj,
    };
  }

  _update() { 
    const { markets, toUsdRate } = this._getTickersInfo();
    this.props.setToUsdtRate(toUsdRate);
    this.props.setMarketsData(markets);
    this.props.fetchCnyUsdRate();
   }

  render() {
    return (
      <Fragment>
        {this.props.children || null}
      </Fragment>
    );
  }
}
