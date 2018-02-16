import flattenPrototypes = require('flatten-prototypes')

import { BitBankStrategyBase } from './base/BitBankStrategyBase'
import { ICandle } from './gekko/ICandle'

class BitBankStrategy2 extends BitBankStrategyBase {

    public check(candle: ICandle): void {
        const featureSet = this.bitBankIndicator.result.lastFeatureset
        console.log('looking for bitbank featureset for candle started at ' + candle.start.toDate())
        if (featureSet) {
            console.log('found featureset: ', JSON.stringify(featureSet))
            if (featureSet.power_imbalance > 1
                && featureSet.wavg_distance_to_midpoint_percent60min > 0
                && featureSet.estimated_future_wavg_5 > 1
            ) {
                this.adviceLong()
            } else if (featureSet.wavg_distance_to_midpoint_percent60min < 0
                       && featureSet.power_imbalance < 1
                       && featureSet.estimated_future_wavg_5 < 1
            ) {
                this.adviceShort()
            }
        } else {
            console.log('no featureset found (not available or too old)')
        }
    }
}

export = flattenPrototypes(new BitBankStrategy2())
