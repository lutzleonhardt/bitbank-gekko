from gekko_backtester import GekkoBackTester
import blackbox as bb
import time

gekko_base_path = '/mnt/d/repos/gekko/'
gekko_strategy = 'BitBankStrategy3'

gekko_market_dict = {
    'exchange': 'poloniex',
    'currency': 'BTC',
    'asset': 'ETH',
    'from': '2018-01-16 01:54',
    'to': '2018-01-19 14:54'
}


def blackbox_gekko(par):
    gekko_strategy_config = {
        'apiKey': 'API-KEY',
        'pair': 'BTC_ETH',
        'maxFeatureSetAgeInSeconds': 60,
        'candlePeriodInMinutes': 1,
        'thresholdWavgDistanceToMidpointPercent60min': par[0],
        'thresholdWavgDistanceToMidpointPercent5min': par[1],
        'thresholdWavgDistanceToMidpointPercent30min': par[2],
        'thresholdPowerImbalance': par[3],
        'thresholdEstimatedFutureWavg5': par[4],
        'thresholdEstimatedFutureWavg30': par[5],
        'thresholdEstimatedFutureWavg60': par[6],
        'thresholdEstimatedFutureWavg120': par[7],
        'thresholdSumFeatures': par[8],
        'thresholdBuyProfit': par[9],
        'backTest': {
            'enable': True,
            'csvPath': "/mnt/d/BitBank/BTC_ETH.csv"
        }
    }
    with GekkoBackTester(gekko_base_path, gekko_strategy) as gekko_backtester:
        (profit_percent, profit_btc, market_profit, trades) = gekko_backtester.execute_backtest(gekko_strategy_config,
                                                                                                gekko_market_dict)

    minimum = -profit_percent

    print('profit: ' + str(profit_percent) + '% (' + str(
        profit_btc) + 'BTC)\tmarket profit: ' + str(market_profit) + '%\ttrades: ' + str(trades) + '\tmin: ' + str(
        minimum))

    return minimum


def main():
    start_time = time.time()
    thresholdWavgDistanceToMidpointPercent60minRange = [-1, 1]
    thresholdWavgDistanceToMidpointPercent5minRange = [-1, 1]
    thresholdWavgDistanceToMidpointPercent30minRange = [-1, 1]
    thresholdPowerImbalanceRange = [-1, 3]
    thresholdEstimatedFutureWavg5Range = [-1, 2]
    thresholdEstimatedFutureWavg30Range = [-1, 2]
    thresholdEstimatedFutureWavg60Range = [-1, 2]
    thresholdEstimatedFutureWavg120Range = [-1, 2]
    thresholdSumFeaturesRange = [5, 6]
    thresholdBuyProfitRange = [0.001, 0.0065]

    bb.search(f=blackbox_gekko,  # given function
              box=[
                  thresholdWavgDistanceToMidpointPercent60minRange,
                  thresholdWavgDistanceToMidpointPercent5minRange,
                  thresholdWavgDistanceToMidpointPercent30minRange,
                  thresholdPowerImbalanceRange,
                  thresholdEstimatedFutureWavg5Range,
                  thresholdEstimatedFutureWavg30Range,
                  thresholdEstimatedFutureWavg60Range,
                  thresholdEstimatedFutureWavg120Range,
                  thresholdSumFeaturesRange,
                  thresholdBuyProfitRange
              ],  # range of values for each parameter
              n=50,  # number of function calls on initial stage (global search)
              m=50,  # number of function calls on subsequent stage (local search)
              batch=8,  # number of calls that will be evaluated in parallel
              resfile=gekko_base_path + 'blackbox/' + gekko_strategy + '/output.csv')  # text file where results will be saved
    print("--- %s seconds ---" % (time.time() - start_time))


if __name__ == '__main__':
    main()
