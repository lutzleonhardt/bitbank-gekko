import * as bitbank from 'bitbank-node-js-api'
import { CsvReader } from './csv-reader'

export interface IBitBankFassade extends bitbank.IBitBank {

    useApi(apiKey: string): this

    useCsv(csv: string): this

    /**
     * used for mode csv; read the featureset by this time
     */
    currentDate: Date
}

export class BitBankFassade implements IBitBankFassade {

    private bitbankApi: bitbank.IBitBank

    private bitbankCsv: CsvReader

    public currentDate: Date

    constructor(private currencyPair: bitbank.CurrencyPair) {
    }

    public useApi(apiKey: string): this {
        this.bitbankApi = bitbank.BitBank(apiKey)
        this.bitbankCsv = null
        return this
    }

    public useCsv(csv: string): this {
        this.bitbankApi = null
        this.bitbankCsv = new CsvReader(csv, this.currencyPair)
        return this
    }

    public fetchAllPairs(callback: (featuresets: bitbank.IFeatureset[]) => void): void {
        if (this.bitbankApi) {
            return this.bitbankApi.fetchAllPairs(callback)
        }
        if (this.bitbankCsv) {
            throw new Error('BitBankFassade.fetchAllPairs() is not implemented for mode csv')
        }
        this.throwFassadeError()
    }

    public fetchPair(currencyPair: bitbank.CurrencyPair, callback: (featureset: bitbank.IFeatureset) => void): void {
        if (this.bitbankApi) {
            return this.bitbankApi.fetchPair(currencyPair, callback)
        }
        if (this.bitbankCsv) {
            if (currencyPair !== this.currencyPair) {
                throw new Error('not supported. We can only initialize CsvReader with one currencyPair at a time')
            }
            this.bitbankCsv.getNextFeatureset(this.currentDate)
                .then((featureset: bitbank.IFeatureset) => callback(featureset))
                .catch((error: any) => {
                    console.error(error)
                    throw new Error('error getting next featureset via bitbankCsv')
                })
            return
        }
        this.throwFassadeError()
    }

    public getHistoricalFeaturesets(currencyPair: bitbank.CurrencyPair, callback: (featuresets: bitbank.IFeatureset[]) => void): void {
        if (this.bitbankApi) {
            return this.bitbankApi.getHistoricalFeaturesets(currencyPair, callback)
        }
        if (this.bitbankCsv) {
            throw new Error('not implemented for bitbankCsv')
        }
    }

    private throwFassadeError() {
        throw new Error('use bitbankApi or bitbankCsv in BitBankFassade')
    }
}