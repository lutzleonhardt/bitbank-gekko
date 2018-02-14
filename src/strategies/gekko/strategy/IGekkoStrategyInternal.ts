import { IBitBankSettings } from '../../base/IBitBankSettings'
import { IGekkoIndicator } from '../indicator/IGekkoIndicator'

/**
 * This is are props and methods which will be injected by gekko on runtime
 */
export interface IGekkoStrategyInternal {
    settings: IBitBankSettings

    talibIndicators: { [key: string]: IGekkoIndicator }

    indicators: { [key: string]: IGekkoIndicator }

    advice(advice: 'short' | 'long'): void
}