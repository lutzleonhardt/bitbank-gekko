import flattenPrototypes = require('flatten-prototypes')
import * as bitbank from "bitbank-node-js-api"

import { BitBankStrategyBase } from './base/BitBankStrategyBase'
import { ICandle } from './gekko/ICandle'

interface IPreprocessedFeatureSet extends bitbank.IFeatureSet {
    should_sell: boolean
}

/**
 * This strategy has just the purpose to backtest a new strategy (preprocess 30 featuresets, see
 * bitbank-usdt_btc-preprocessed.csv / https://bigquery.cloud.google.com/savedquery/530942804334:3af3a49d45a34944a09de09593d9388e)
 * strategy is ONLY for backtesting this sample CSV
 */
class BitBankStrategyOnlyBacktestingPreprocessedData extends BitBankStrategyBase {
    public check(candle: ICandle): void {
        const featureSet = <IPreprocessedFeatureSet>this.bitBankIndicator.result.lastFeatureset
        console.log('looking for bitbank featureset for candle started at ' + candle.start.toDate())
        if (featureSet) {
            console.log('found featureset: ', JSON.stringify(featureSet))
            if (!featureSet.should_sell) {
                this.adviceLong()
            } else {
                this.adviceShort()
            }
        } else {
            console.log('no featureset found (not available or too old)')
        }
    }
}

export = flattenPrototypes(new BitBankStrategyOnlyBacktestingPreprocessedData())
