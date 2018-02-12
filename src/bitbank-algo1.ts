import { BitbankBase, ICandle } from './bitbank-base'
const flattenPrototypes = require('flatten-prototypes')

class BitbankAlgo1 extends BitbankBase {
    public update(candle: ICandle): void {
    }

    public log(): void {
    }

    public check(candle: ICandle): void {
        console.log(candle)
    }

    public end(): void {
    }
}

export = flattenPrototypes(new BitbankAlgo1())