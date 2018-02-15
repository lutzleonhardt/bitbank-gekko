import * as bitbank from 'bitbank-node-js-api'

import { CsvReader } from './csv/CsvReader'
import { IBitBankFacade } from './IBitBankFacade'

/**
 * Encapsulates access to BitBank prediction data (CSV or API)
 */
export class BitBankFacade implements IBitBankFacade {

    private bitbankApi: bitbank.IBitBank

    private bitbankCsv: CsvReader

    private currentDate: Date

    constructor(private currencyPair: bitbank.CurrencyPair) {
    }

    public setCurrentDate(date: Date) {
        this.currentDate = date
        return this
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

    private convertApiFeatureSetValue(property: string, value: string): string | Date | number {
        switch (property) {
            case 'currency_pair':
                // type is string
                return value
            case 'create_date':
            case 'date':
                // type is number -> unix time
                return new Date(parseFloat(value) * 1000 /* in ms */)
            default:
                // type is float
                return parseFloat(value)
        }
    }

    private convertApiFeatureSet(featureSet: bitbank.IFeatureSet): bitbank.IFeatureSet {
        if (featureSet) {
            for (const key in featureSet) {
                featureSet[ key ] = this.convertApiFeatureSetValue(key, featureSet[ key ])
            }
        }
        return featureSet
    }

    public fetchAllPairs(callback: (featureSets: bitbank.IFeatureSet[]) => void): void {
        if (this.bitbankApi) {
            return this.bitbankApi.fetchAllPairs((featureSets: bitbank.IFeatureSet[]) => {
                callback(featureSets.map(fs => this.convertApiFeatureSet(fs)))
            })
        }
        if (this.bitbankCsv) {
            throw new Error('BitBankFacade.fetchAllPairs() is not implemented for mode csv')
        }
        this.throwFacadeError()
    }

    public fetchPair(currencyPair: bitbank.CurrencyPair, callback: (featureSet: bitbank.IFeatureSet) => void): void {
        if (this.bitbankApi) {
            return this.bitbankApi.fetchPair(currencyPair, fs => callback(this.convertApiFeatureSet(fs)))
        }
        if (this.bitbankCsv) {
            if (currencyPair !== this.currencyPair) {
                throw new Error('not supported. We can only initialize CsvReader with one currencyPair at a time')
            }
            this.bitbankCsv.getNextFeatureset(this.currentDate)
                .then((featureset: bitbank.IFeatureSet) => callback(featureset))
                .catch((error: any) => {
                    console.error(error)
                    throw new Error('error getting next featureset via bitbankCsv')
                })
            return
        }
        this.throwFacadeError()
    }

    public getHistoricalFeaturesets(currencyPair: bitbank.CurrencyPair, callback: (featureSets: bitbank.IFeatureSet[]) => void): void {
        if (this.bitbankApi) {
            return this.bitbankApi.getHistoricalFeaturesets(currencyPair, (featureSets: bitbank.IFeatureSet[]) => {
                callback(featureSets.map(fs => this.convertApiFeatureSet(fs)))
            })
        }
        if (this.bitbankCsv) {
            throw new Error('not implemented for bitbankCsv')
        }
    }

    private throwFacadeError() {
        throw new Error('use bitbankApi or bitbankCsv in BitBankFacade')
    }
}