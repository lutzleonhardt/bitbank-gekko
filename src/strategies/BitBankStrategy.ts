import flattenPrototypes = require('flatten-prototypes')

import { BitBankStrategyBase } from './base/BitBankStrategyBase'
import { ICandle } from './gekko/ICandle'

class BitBankStrategy extends BitBankStrategyBase {

    public check(candle: ICandle): void {
        const featureSet = this.bitBankIndicator.result.lastFeatureset
        console.log('looking for bitbank featureset for candle started at ' + candle.start.toDate())
        if (featureSet) {
            console.log('found featureset: ', featureSet.date, featureSet.id, featureSet.power_imbalance)
            // not so good sample strategy
            if (featureSet.power_imbalance > 1 
                 && featureSet.wavg_distance_to_midpoint_percent60min > 0 
                 && featureSet.wavg_distance_to_midpoint_percent5min > 0  
                 && featureSet.wavg_distance_to_midpoint_percent30min > 0  
                 && featureSet.power_imbalance > 1  
                 && featureSet.estimated_future_wavg_5 > 1  
                 && featureSet.estimated_future_wavg_30 > 1  
                 && featureSet.estimated_future_wavg_60 > 1  
                 && featureSet.estimated_future_wavg_120 > 1
               ) {
                this.adviceLong()
            } else if (featureSet.wavg_distance_to_midpoint_percent60min < 0 
                       && featureSet.wavg_distance_to_midpoint_percent5min < 0  
                       && featureSet.wavg_distance_to_midpoint_percent30min < 0  
                       && featureSet.power_imbalance < 1  
                       && featureSet.estimated_future_wavg_5 < 1  
                       && featureSet.estimated_future_wavg_30 < 1  
                       && featureSet.estimated_future_wavg_60 < 1  
                       && featureSet.estimated_future_wavg_120 < 1
                      ) {
                this.adviceShort()
            }
        } else {
            console.log('no featureset found (not available or too old)')
        }
    }
}

export = flattenPrototypes(new BitBankStrategy())
