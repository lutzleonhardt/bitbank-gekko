import { IIndicatorGekkoResult, IIndicatorResult } from '../../indicator/IIndicatorResult'
import { CandleProps, ICandle } from '../ICandle'

export type IndicatorInput = 'price' | 'candle'

/**
 * Can be registered as sync and async (tulip) indicator in gekko
 */
export interface IGekkoIndicator {
    input: IndicatorInput

    result: IIndicatorResult

    update(candle: ICandle): void

    run(candleProps: CandleProps, callback: (err: string, result: IIndicatorGekkoResult) => void): void
}
