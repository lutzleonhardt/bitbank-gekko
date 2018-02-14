import * as moment from 'moment';

export interface ICandle {
    start: moment.Moment // [moment object of the start time of the candle],
    open: number // [number, open of candle],
    high: number // [number, high of candle],
    low: number // [number, low of candle],
    close: number // [number, close of candle],
    vwp: number // [number, average weighted price of candle],
    volume: number // [number, total volume volume],
    trades: number // [number, amount of trades]
}

export type CandleProps = { [P in keyof ICandle]: ICandle[P][] }
