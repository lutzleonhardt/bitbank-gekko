import 'mocha'
const algo1 = require('./bitbank-algo1')

describe('bitbank-algo1', () => {
    it('test', () => {
        algo1.settings = {
            apikey  : 'api-key',
            pair    : 'BTC_ETC',
            backtest: {
                enable: false,
            },
        }
        algo1.init()
        // add some expectations
    })
})