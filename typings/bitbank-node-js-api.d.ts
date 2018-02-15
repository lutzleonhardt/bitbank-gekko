export = BitBank
declare namespace BitBank {
    type CurrencyPair =
        'BTC_AMP' |
        'BTC_ARDR' |
        'BTC_BCH' |
        'BTC_BCN' |
        'BTC_BELA' |
        'BTC_BLK' |
        'BTC_BTCD' |
        'BTC_BTS' |
        'BTC_BURST' |
        'BTC_DASH' |
        'BTC_DCR' |
        'BTC_DGB' |
        'BTC_EMC2' |
        'BTC_ETC' |
        'BTC_ETH' |
        'BTC_EXP' |
        'BTC_FCT' |
        'BTC_FLDC' |
        'BTC_FLO' |
        'BTC_GAME' |
        'BTC_GNO' |
        'BTC_GNT' |
        'BTC_GRC' |
        'BTC_HUC' |
        'BTC_LBC' |
        'BTC_LSK' |
        'BTC_LTC' |
        'BTC_MAID' |
        'BTC_NAV' |
        'BTC_NEOS' |
        'BTC_NMC' |
        'BTC_NXC' |
        'BTC_NXT' |
        'BTC_OMNI' |
        'BTC_PASC' |
        'BTC_PINK' |
        'BTC_POT' |
        'BTC_PPC' |
        'BTC_REP' |
        'BTC_SC' |
        'BTC_STR' |
        'BTC_STRAT' |
        'BTC_SYS' |
        'BTC_VIA' |
        'BTC_VTC' |
        'BTC_XBC' |
        'BTC_XEM' |
        'BTC_XMR' |
        'BTC_XRP' |
        'BTC_ZEC' |
        'ETH_BCH' |
        'ETH_ETC' |
        'ETH_GNO' |
        'ETH_GNT' |
        'ETH_LSK' |
        'ETH_REP' |
        'ETH_ZEC' |
        'USDT_BCH' |
        'USDT_BTC' |
        'USDT_DASH' |
        'USDT_ETC' |
        'USDT_ETH' |
        'USDT_LTC' |
        'USDT_NXT' |
        'USDT_REP' |
        'USDT_STR' |
        'USDT_XMR' |
        'USDT_XRP' |
        'USDT_ZEC' |
        'XMR_DASH' |
        'XMR_LTC' |
        'XMR_NXT' |
        'XMR_ZEC'

    interface IFeatureSet {
        [index: string]: any // for accessing object via indexer
        id: number,
        weighted_trade_average60: number,
        weighted_trade_slope60: number,
        weighted_trade_r_value60: number,
        wavg_distance_to_midpoint_percent60min: number,
        weighted_trade_average5min: number,
        weighted_trade_slope5min: number,
        weighted_trade_r_value5min: number,
        wavg_distance_to_midpoint_percent5min: number,
        weighted_trade_average30min: number,
        weighted_trade_slope30min: number,
        weighted_trade_r_value30min: number,
        wavg_distance_to_midpoint_percent30min: number,
        spread_percent: number,
        power_imbalance: number,
        currency_pair: CurrencyPair,
        create_date: Date,
        date: Date,
        future_wavg_5: number,
        future_wstd_5: number,
        future_wavg_30: number,
        future_wstd_30: number,
        future_wavg_60: number,
        future_wstd_60: number,
        future_wavg_120: number,
        future_wstd_120: number,
        has_future_data: number,
        best_ask_price: number,
        best_bid_price: number,
        estimated_future_wavg_5: number,
        estimated_future_wavg_30: number,
        estimated_future_wavg_60: number,
        estimated_future_wavg_120: number,
        recommended_buy: number,
        recommended_sell: number,
        recommended_buy_profit: number,
        recommended_sell_profit: number
    }

    interface IBitBank {
        fetchAllPairs(callback: (featuresets: IFeatureSet[]) => void): void

        fetchPair(currencyPair: CurrencyPair, callback: (featureset: IFeatureSet) => void): void

        getHistoricalFeaturesets(currencyPair: CurrencyPair, callback: (featuresets: IFeatureSet[]) => void): void
    }

    function BitBank(apiKey: string): IBitBank
}

