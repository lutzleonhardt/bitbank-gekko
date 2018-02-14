import * as bitbank from 'bitbank-node-js-api'

export interface IIndicatorResult {
    lastFeatureset: bitbank.IFeatureSet
}

export type IIndicatorGekkoResult = { [P in keyof IIndicatorResult]: IIndicatorResult[P][] }