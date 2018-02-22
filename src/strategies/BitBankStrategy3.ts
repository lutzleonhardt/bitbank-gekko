import flattenPrototypes = require('flatten-prototypes')

import { BitBankStrategyBase } from './base/BitBankStrategyBase'
import { ICandle } from './gekko/ICandle'
import { IBitBankSettings } from '../strategies/base/IBitBankSettings'

interface IBitBankStrategy3Settings extends IBitBankSettings {
    thresholdWavgDistanceToMidpointPercent60min: number
    thresholdWavgDistanceToMidpointPercent5min: number
    thresholdWavgDistanceToMidpointPercent30min: number
    thresholdPowerImbalance: number
    thresholdEstimatedFutureWavg5: number
    thresholdEstimatedFutureWavg30: number
    thresholdEstimatedFutureWavg60: number
    thresholdEstimatedFutureWavg120: number
    thresholdSumFeatures: number
    thresholdBuyProfit: number
}

class BitBankStrategy3 extends BitBankStrategyBase {

    private buyPrice = 0

    public check(candle: ICandle): void {


        const featureSet = this.bitBankIndicator.result.lastFeatureset
        console.log('looking for bitbank featureset for candle started at ' + candle.start.toDate())
        if (featureSet) {
            console.log('found featureset: ', JSON.stringify(featureSet))
            const settings = this.getSettings() as IBitBankStrategy3Settings

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
                featureSet.wavg_distance_to_midpoint_percent60min > settings.thresholdWavgDistanceToMidpointPercent60min
                && featureSet.wavg_distance_to_midpoint_percent5min > settings.thresholdWavgDistanceToMidpointPercent5min
                && featureSet.wavg_distance_to_midpoint_percent30min > settings.thresholdWavgDistanceToMidpointPercent30min
                && featureSet.power_imbalance > settings.thresholdPowerImbalance
                && featureSet.estimated_future_wavg_5 > settings.thresholdEstimatedFutureWavg5
                && featureSet.estimated_future_wavg_30 > settings.thresholdEstimatedFutureWavg30
                && featureSet.estimated_future_wavg_60 > settings.thresholdEstimatedFutureWavg60
                && featureSet.estimated_future_wavg_120 > settings.thresholdEstimatedFutureWavg120
                && sum > settings.thresholdSumFeatures
            ) {
                this.buyPrice = candle.close
                this.adviceLong()
                return
            }

            const profit = candle.close / this.buyPrice - 1 //i.e. 1 (=100%) for doubling profit
            console.log(profit)
            if (this.buyPrice > 0 && profit >= settings.thresholdBuyProfit) {
                this.buyPrice = 0
                this.adviceShort()
            }

        } else {
            console.log('no featureset found (not available or too old)')
        }
    }
}

export = flattenPrototypes(new BitBankStrategy3())
