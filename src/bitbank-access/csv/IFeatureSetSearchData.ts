import * as bitbank from 'bitbank-node-js-api'

export interface IFeatureSetSearchData {
    beforeDate: Date
    resolve: (value?: bitbank.IFeatureSet) => void
    reject: (reason?: any) => void
}