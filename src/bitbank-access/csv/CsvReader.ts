import * as bitbank from 'bitbank-node-js-api'
import LineByLineReader = require('line-by-line')

import { IFeatureSetSearchData } from './IFeatureSetSearchData'

export class CsvReader {

    private lineByLineReader: LineByLineReader

    private columnMap: { [column: number]: string } = {}

    private lineNumber = -1

    private prevFeatureset: bitbank.IFeatureSet

    private nextFeatureset: bitbank.IFeatureSet

    private featuresetSearchData: IFeatureSetSearchData

    public constructor(private csv: string,
                       private currencyPair: bitbank.CurrencyPair) {
        this.lineByLineReader = new LineByLineReader(csv, { skipEmptyLines: true })
        this.lineByLineReader.on('line', (data) => this.getNextLine(data))
        this.lineByLineReader.on('error', (error) => console.error(error))
        this.lineByLineReader.on('end', () => this.endLine())
    }

    public dispose() {
        if (this.lineByLineReader) {
            this.lineByLineReader.close()
        }
        this.lineByLineReader = null
        console.log('dispose the csv-reader')
    }

    public isClosed() {
        return !this.lineByLineReader
    }

    public async getNextFeaturesetAsync(date: Date) {
        return await this.getNextFeatureset(date)
    }

    public getNextFeatureset(date: Date): Promise<bitbank.IFeatureSet> {
        if (this.featuresetSearchData) { // featureset search currently in progress
            return null
        }
        return new Promise<bitbank.IFeatureSet>((resolve, reject) => {
            this.featuresetSearchData = {
                beforeDate: date,
                reject,
                resolve,
            }

            this.checkCurrentFeatureset()
            if (this.featuresetSearchData) {
                // current featureset does not contain our wanted on, so resume getting the next line
                this.lineByLineReader.resume()
            }

        })
    }

    private static convertColumnContent(property: string, value: string): string | Date | number | boolean {
        switch (property) {
            case 'should_sell':
                return value === 'true' //not available in the default featureset (just for a special preprocessed featureset)
            case 'currency_pair':
                // type is string
                return value
            case 'create_date':
            case 'date':
                // type is date
                return new Date(value)
            default:
                // type is float
                return parseFloat(value)
        }
    }

    private mapLineToFeatureset(line: string): bitbank.IFeatureSet {
        const featureSet: { [key: string]: any } = {}
        const splits = line.split(',')
        splits.forEach((value, columnNumber) => {
            const property = this.columnMap[ columnNumber ]
            featureSet[ property ] = CsvReader.convertColumnContent(property, value)
        })
        return <bitbank.IFeatureSet>featureSet
    }

    private initializeHeaderLine(line: string) {
        line.split(',')
            .forEach((column, columnNumber) => this.columnMap[ columnNumber ] = column)
        if (!this.featuresetSearchData) {
            // only pause when no search is in progress
            this.lineByLineReader.pause()
        }
    }

    private resolveFeaturesetAndPauseCsvReader(featureset: bitbank.IFeatureSet) {
        if (this.featuresetSearchData) {
            this.featuresetSearchData.resolve(featureset)
            this.featuresetSearchData = null
        }
        this.lineByLineReader.pause()
    }

    private isPrevFeaturesetAvailable() {
        return this.prevFeatureset != null && this.prevFeatureset.currency_pair === this.currencyPair
    }

    private isNextFeaturesetAvailable() {
        return this.nextFeatureset != null && this.nextFeatureset.currency_pair === this.currencyPair
    }

    private isNoFeaturesetForDateAvailable() {
        const date = this.featuresetSearchData.beforeDate
        return this.prevFeatureset.date > date && this.nextFeatureset.date > date
    }

    private isFeaturesetForDateAvailable() {
        const date = this.featuresetSearchData.beforeDate
        return this.prevFeatureset.date <= date && this.nextFeatureset.date > date
    }

    private checkCurrentFeatureset() {
        if (this.isPrevFeaturesetAvailable()) {

            if (this.isNextFeaturesetAvailable()) {
                if (this.isFeaturesetForDateAvailable()) {
                    this.resolveFeaturesetAndPauseCsvReader(this.prevFeatureset)
                } else if (this.isNoFeaturesetForDateAvailable()) {
                    this.resolveFeaturesetAndPauseCsvReader(null)
                }
            } else {
                this.resolveFeaturesetAndPauseCsvReader(this.prevFeatureset)
            }
        }
    }

    private getNextLine(line: string) {
        this.lineNumber++
        if (this.lineNumber === 0) {
            this.initializeHeaderLine(line)
            return
        }

        // set featureset
        this.prevFeatureset = this.nextFeatureset
        this.nextFeatureset = line ? this.mapLineToFeatureset(line) : null

        this.checkCurrentFeatureset()
    }

    private endLine() {
        console.log('csv-reader: end of lines reached')
        this.getNextLine(null)
        this.dispose()
    }
}
