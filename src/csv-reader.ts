import LineByLineReader = require('line-by-line')
import * as bitbank from 'bitbank-node-js-api'

interface IFeaturesetSearchData {
    beforeDate: Date
    resolve: (value?: bitbank.IFeatureset) => void
    reject: (reason?: any) => void
}

export class CsvReader {

    private lineByLineReader: LineByLineReader

    private columnMap: { [column: number]: string } = {}

    private lineNumber = -1

    private prevFeatureset: bitbank.IFeatureset

    private nextFeatureset: bitbank.IFeatureset

    private featuresetSearchData: IFeaturesetSearchData

    public constructor(private csv: string,
                       private currencyPair: bitbank.CurrencyPair) {
        this.lineByLineReader = new LineByLineReader(csv)
        this.lineByLineReader.on('line', (data) => this.getNextLine(data))
        this.lineByLineReader.on('error', (error) => console.error(error))
        this.lineByLineReader.on('end', () => this.endLine())
    }

    public dispose() {
        if (this.lineByLineReader) {
            this.lineByLineReader.close()
        }
        this.lineByLineReader = null
    }

    public async getNextFeaturesetAsync(date: Date) {
        return await this.getNextFeatureset(date)
    }

    public getNextFeatureset(date: Date): Promise<bitbank.IFeatureset> {
        if (this.featuresetSearchData || // featureset search currently in progress
            !this.lineByLineReader) { // csv reader is still disposed
            return null
        }
        return new Promise<bitbank.IFeatureset>((resolve, reject) => {
            this.featuresetSearchData = {
                beforeDate: date,
                reject,
                resolve,
            }
            this.lineByLineReader.resume()
        })
    }

    private static convertColumnContent(property: string, value: string): string | Date | number {
        switch (property) {
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

    private mapLineToFeatureset(line: string): bitbank.IFeatureset {
        const featureSet: { [key: string]: any } = {}
        const splits = line.split(',')
        splits.forEach((value, columnNumber) => {
            const property = this.columnMap[ columnNumber ]
            featureSet[ property ] = CsvReader.convertColumnContent(property, value)
        })
        return <bitbank.IFeatureset>featureSet
    }

    private initializeHeaderLine(line: string) {
        line.split(',')
            .forEach((column, columnNumber) => this.columnMap[ columnNumber ] = column)
        if (!this.featuresetSearchData) {
            // only pause when no search is in progress
            this.lineByLineReader.pause()
        }
    }

    private resolveFeaturesetAndStopCsvReader(featureset: bitbank.IFeatureset) {
        if (this.featuresetSearchData) {
            this.featuresetSearchData.resolve(featureset)
            this.featuresetSearchData = null
        }
        if (!featureset) {
            // csv is ending
            this.dispose()
        } else {
            this.lineByLineReader.pause()
        }
    }

    private getNextLine(line: string) {
        this.lineNumber++
        if (this.lineNumber === 0) {
            this.initializeHeaderLine(line)
            return
        }

        const date = this.featuresetSearchData.beforeDate
        if (this.prevFeatureset != null && this.prevFeatureset.date <= date && this.prevFeatureset.currency_pair === this.currencyPair &&
            this.nextFeatureset != null && this.nextFeatureset.date > date && this.nextFeatureset.currency_pair === this.currencyPair
        ) {
            this.resolveFeaturesetAndStopCsvReader(this.prevFeatureset)
        }

        this.prevFeatureset = this.nextFeatureset
        this.nextFeatureset = this.mapLineToFeatureset(line)
    }

    private endLine() {
        this.resolveFeaturesetAndStopCsvReader(null)
    }
}
