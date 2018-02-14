import * as bitbank from "bitbank-node-js-api"

export interface IBitBankSettings {
    pair: bitbank.CurrencyPair
    apiKey?: string
    maxFeatureSetAgeInSeconds: number
    candlePeriodInMinutes: number
    backTest: {
        enable: boolean
        csvPath?: string
    }
}