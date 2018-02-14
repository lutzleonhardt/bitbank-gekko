import { ICandle } from '../ICandle'

/**
 * interface for our own strategy
 */
export interface IGekkoStrategy {
    adviceShort(): void

    adviceLong(): void

    init(): void

    update(candle: ICandle): void

    log(): void

    check(candle: ICandle): void

    end(): void
}