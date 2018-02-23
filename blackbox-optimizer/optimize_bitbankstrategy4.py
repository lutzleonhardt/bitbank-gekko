from gekko_backtester import GekkoBackTester
import blackbox as bb
import time

gekko_base_path = '/mnt/d/repos/gekko/'
gekko_strategy = 'BitBankStrategy4'

gekko_market_dict = {
    'exchange': 'poloniex',
    'currency': 'BTC',
    'asset': 'ETH',
    'from': '2017-12-22 00:02',
    'to': '2018-01-21 23:02'
}


def blackbox_gekko(par):
    gekko_strategy_config = {
        'apiKey': 'API-KEY',
        'pair': 'BTC_ETH',
        'maxFeatureSetAgeInSeconds': 60,
        'candlePeriodInMinutes': 1,
        'thresholdSumFeaturesForBuy': par[0],
        'thresholdSumFeaturesForSell': par[1],
        'backTest': {
            'enable': True,
            'csvPath': '/mnt/d/repos/bitbank-gekko/backtest-data/bitbank-btc_eth-by-date.csv'
        }
    }
    with GekkoBackTester(gekko_base_path, gekko_strategy) as gekko_backtester:
        (profit_percent, profit_btc, market_profit, trades) = gekko_backtester.execute_backtest(gekko_strategy_config,
                                                                                                gekko_market_dict)

    minimum = -profit_percent - trades  # optimize by profit and by amount of trades

    print('profit: ' + str(profit_percent) + '% (' + str(
        profit_btc) + 'BTC)\tmarket profit: ' + str(market_profit) + '%\ttrades: ' + str(trades) + '\tmin: ' + str(
        minimum))

    return minimum


def main():
    start_time = time.time()
    thresholdSumFeaturesForBuy = [3, 8]
    thresholdSumFeaturesForSell = [-3, 5]

    bb.search(f=blackbox_gekko,  # given function
              box=[thresholdSumFeaturesForBuy, thresholdSumFeaturesForSell],  # range of values for each parameter
              n=100,  # number of function calls on initial stage (global search)
              m=100,  # number of function calls on subsequent stage (local search)
              batch=12,  # number of calls that will be evaluated in parallel
              resfile=gekko_base_path + 'blackbox/' + gekko_strategy + '/output.csv')  # text file where results will be saved
    print("--- %s seconds ---" % (time.time() - start_time))


if __name__ == '__main__':
    main()
