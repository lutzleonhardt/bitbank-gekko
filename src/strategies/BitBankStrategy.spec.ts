import 'mocha'

const algo1 = require('./BitBankStrategy')

describe('bitbank-strategy', () => {
    it('simple test', () => {
        //injected by gekko
        algo1.settings = {
            apiKey                   : 'api-key',
            pair                     : 'BTC_ETC',
            maxFeatureSetAgeInSeconds: 60,
            candlePeriodInMinutes    : 1,
            backTest                 : {
                enable: false,
            },
        }
        algo1.talibIndicators = {}
        algo1.indicators = {}

        algo1.init()
        // add some expectations
    })
})