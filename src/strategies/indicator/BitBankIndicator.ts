import * as moment from 'moment'

import { BitBankFacade } from '../../bitbank-access/BitBankFacade'
import { CandleProps, ICandle } from '../gekko/ICandle'
import { IBitBankSettings } from '../base/IBitBankSettings'
import { IGekkoIndicator, IndicatorInput } from '../gekko/indicator/IGekkoIndicator'
import { IIndicatorGekkoResult, IIndicatorResult } from './IIndicatorResult'

/**
 * The BitBankIndicator will be added to the gekko indicators and tulipIndicators.
 * This is a little dirty, but the only option because our bitbank data access is async. That means, gekko has to wait for our results until it may pass in a
 * new candle. It's not possible to implement this behaviour with a normal gekko strategy plugin. So we fake a tulip (gekko builtin) strategy, because these
 * indicators are executed async. But the tulip indicators don't get the candles passed in (instead the CandleProps). But the CandleProps does not contain the
 * start time, which we need to read the correct csv line. That's the reason why we register this indicator as sync indicator as well. Then we get a candle
 * every tick (via the update method).
 */
export class BitBankIndicator implements IGekkoIndicator {

    private bitbankFacade: BitBankFacade

    private currentCandle: ICandle

    public input: IndicatorInput = 'candle'

    public result: IIndicatorResult

    public constructor(private settings: IBitBankSettings) {
        this.bitbankFacade = new BitBankFacade(settings.pair)
        if (settings.backTest.enable) {
            this.bitbankFacade.useCsv(settings.backTest.csvPath)
        } else {
            this.bitbankFacade.useApi(settings.apiKey)
        }
    }

    /**
     * Method for calculating indicator result synchronous
     * we use this method in our async indicator, to get the current time, which is only available in the passed candle
     * @param {ICandle} candle
     */
    public update(candle: ICandle): void {
        // ignore synchronous future candles
        if (!this.currentCandle) {
            this.currentCandle = candle
        }
    }

    /**
     * Method for calculating indicator result asynchronous
     * @param {CandleProps} candleProps
     * @param {(err: string, result: any) => void} callback
     */
    public run(candleProps: CandleProps, callback: (err: string, result: IIndicatorGekkoResult) => void): void {
        // candleProps props does not contain start time, therefore we use

        const currentDate = moment(this.currentCandle.start)
            .add(this.settings.candlePeriodInMinutes, 'minute')

        this.bitbankFacade
            .setCurrentDate(currentDate.toDate())
            .fetchPair(this.settings.pair, (featureset) => {
                this.currentCandle = null

                if (featureset) {
                    const age = currentDate.diff(moment(featureset.date), 's')
                    const maxAge = this.settings.maxFeatureSetAgeInSeconds
                    if (age >= maxAge) {
                        console.log(`featureSet ${featureset.id} is too old (${age}s older than ${maxAge}s)`)
                        featureset = null
                    }
                }
                callback(null, { lastFeatureset: [ featureset ] })
            })
    }
}