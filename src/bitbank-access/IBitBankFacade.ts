import * as bitbank from 'bitbank-node-js-api'

export interface IBitBankFacade extends bitbank.IBitBank {
    useApi(apiKey: string): this

    useCsv(csv: string): this

    /**
     * used for mode csv; read the featureset by this timestamp
     */
    setCurrentDate(date: Date): this
}