import flattenPrototypes = require('flatten-prototypes')

import { BitBankStrategyBase } from './base/BitBankStrategyBase'
import { ICandle } from './gekko/ICandle'

class BitBankStrategy3 extends BitBankStrategyBase {

    private buyPrice = 0

    public check(candle: ICandle): void {
        const featureSet = this.bitBankIndicator.result.lastFeatureset
        console.log('looking for bitbank featureset for candle started at ' + candle.start.toDate())
        if (featureSet) {
            console.log('found featureset: ', JSON.stringify(featureSet))

            // maybe use this as well
            // const percentUnderBestBid = (featureSet.best_bid_price - featureSet.recommended_buy) / featureSet.best_bid_price * 100

            const sum = featureSet.wavg_distance_to_midpoint_percent60min +
                        featureSet.wavg_distance_to_midpoint_percent5min +
                        featureSet.wavg_distance_to_midpoint_percent30min +
                        featureSet.power_imbalance +
                        featureSet.estimated_future_wavg_5 +
                        featureSet.estimated_future_wavg_30 +
                        featureSet.estimated_future_wavg_60 +
                        featureSet.estimated_future_wavg_120

            if (
                this.buyPrice === 0 &&
                featureSet.wavg_distance_to_midpoint_percent60min > 0
                && featureSet.wavg_distance_to_midpoint_percent5min > 0
                && featureSet.wavg_distance_to_midpoint_percent30min > 0
                && featureSet.power_imbalance > 1
                && featureSet.estimated_future_wavg_5 > 1
                && featureSet.estimated_future_wavg_30 > 1
                && featureSet.estimated_future_wavg_60 > 1
                && featureSet.estimated_future_wavg_120 > 1
                && sum > 5.03
            ) {
                this.buyPrice = candle.close
                this.adviceLong()
                return
            }

            const profit = candle.close * 100 / this.buyPrice - 100
            if (this.buyPrice > 0 && profit >= 0.65) {
                this.buyPrice = 0
                this.adviceShort()
            }

        } else {
            console.log('no featureset found (not available or too old)')
        }
    }
}

export = flattenPrototypes(new BitBankStrategy3())
