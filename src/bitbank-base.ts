import { BitBankFassade } from './bitbank-fassade'
import * as bitbank from 'bitbank-node-js-api'

export interface ICandle {
    start: number // [moment object of the start time of the candle],
    open: number // [number, open of candle],
    high: number // [number, high of candle],
    low: number // [number, low of candle],
    close: number // [number, close of candle],
    vwp: number // [number, average weighted price of candle],
    volume: number // [number, total volume volume],
    trades: number // [number, amount of trades]
}

export interface IGekkoPlugin {
    settings: IBaseSettings

    init(): void

    update(candle: ICandle): void

    log(): void

    check(candle: ICandle): void

    end(): void
}

export interface IBaseSettings {
    pair: bitbank.CurrencyPair
    apikey?: string,
    backtest: {
        enable: boolean
        csv?: string
    }
}

export abstract class BitbankBase implements IGekkoPlugin {

    public settings: IBaseSettings //injected by gekko

    protected bitbankFassade: BitBankFassade

    public constructor() {
    }

    public init() {
        const settings = this.settings
        this.bitbankFassade = new BitBankFassade(settings.pair)

        if (this.settings.backtest.enable) {
            this.bitbankFassade.useCsv(settings.backtest.csv)
        } else {
            this.bitbankFassade.useApi(settings.apikey)
        }
    }

    public abstract update(candle: any): void

    public abstract log(): void

    public abstract check(candle: any): void

    public abstract end(): void
}