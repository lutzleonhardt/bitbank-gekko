import { BitBankIndicator } from '../indicator/BitBankIndicator'
import { IGekkoStrategy } from '../gekko/strategy/IGekkoStrategy'
import { IGekkoStrategyInternal } from '../gekko/strategy/IGekkoStrategyInternal'

export abstract class BitBankStrategyBase implements IGekkoStrategy {

    public bitBankIndicator: BitBankIndicator

    public constructor() {
    }

    protected gekko(): IGekkoStrategyInternal {
        return <IGekkoStrategyInternal><any>this
    }

    public getSettings() {
        return this.gekko().settings
    }

    public adviceShort() {
        this.gekko()
            .advice('short')
    }

    public adviceLong() {
        this.gekko()
            .advice('long')
    }

    public init() {
        this.bitBankIndicator = new BitBankIndicator(this.getSettings())
        this.registerBitBankIndicator()
    }

    public update(candle: any) {}

    public log() {}

    public check(candle: any) {}

    public end() {}

    private registerBitBankIndicator() {
        this.gekko().talibIndicators[ 'bitBankIndicator' ] = this.bitBankIndicator
        this.gekko().indicators[ 'bitBankIndicator' ] = this.bitBankIndicator
    }
}