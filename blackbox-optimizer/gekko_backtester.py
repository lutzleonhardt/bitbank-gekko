import json
import time
import os
import subprocess
import re


class GekkoBackTester:

    def __init__(self, gekko_base_path, gekko_strategy):
        self.gekko_base_path = gekko_base_path
        self.version = str(int(round(time.time() * 1000))) + str(os.getpid())
        self.gekko_strategy = gekko_strategy

    @property
    def gekko_file(self):
        return self.gekko_base_path + 'gekko'

    @property
    def gekko_config_dir(self):
        return 'blackbox/' + self.gekko_strategy

    @property
    def gekko_config_file(self):
        return self.gekko_config_dir + '/config' + self.version + '.js'

    def execute_backtest(self, strategy_dict, market_dict):
        """"
        calculate the profit in an gekko backtest using specified config
        :returns (profit_percent, profit_btc, market_profit, trades)
        """
        self.__write_config_to_file(strategy_dict, market_dict)
        return self.__calculate_gekko_profit()

    def __write_config_to_file(self, strategy_dict, market_dict):
        config_dict = {
            'debug': False,
            'watch': market_dict,
            'tradingAdvisor': {
                'enabled': True,
                'method': self.gekko_strategy,
                'candleSize': 1,
                'historySize': 0
            },
            'paperTrader': {
                'enabled': True,
                'reportInCurrency': True,
                'feeMaker': 0.25,
                'feeTaker': 0.25,
                'feeUsing': 'maker',
                'slippage': 0.05,
                'simulationBalance': {
                    'asset': 1,
                    'currency': 100
                }
            },
            'performanceAnalyzer': {
                'enabled': True,
                'riskFreeReturn': 5
            },
            'trader': {
                'enabled': False
            },
            'adapter': 'sqlite', 'sqlite': {
                'path': 'plugins/sqlite',
                'dataDirectory': 'history',
                'version': 0.1,
                'journalMode': 'DELETE',
                'dependencies': []
            },
            'backtest': {
                'daterange': {
                    'from': market_dict['from'],
                    'to': market_dict['to']
                },
                'batchSize': 50
            },
            self.gekko_strategy: strategy_dict}

        config_json = 'var config = ' + json.dumps(config_dict, indent=4) + '\nmodule.exports = config;'

        if not os.path.exists(self.gekko_base_path + self.gekko_config_dir):
            os.makedirs(self.gekko_base_path + self.gekko_config_dir)

        with open(self.gekko_base_path + self.gekko_config_file, 'w') as outfile:
            outfile.write(config_json)

    def __calculate_gekko_profit(self):
        stdout = ''
        try:
            proc = subprocess.Popen(['node', self.gekko_file, '--backtest', '--config', self.gekko_config_file],
                                    stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
            (stdout, stderr) = proc.communicate()
            result_lines = stdout[-1011:]

            # market_profit
            # 2018-02-23 00:21:36 (INFO):     (PROFIT REPORT) Market:                          -3.07340426%
            market_line = re.search('Market:.+', result_lines).group().replace('\t', '').replace(' ', '')
            # Market:-3.07340426%
            market_profit = re.search(':.+%', market_line).group()[1:-1]

            # amount of trades
            # 2018-02-23 00:21:36 (INFO):     (PROFIT REPORT) amount of trades:                0
            trades_line = re.search('amount of trades:.+', result_lines).group().replace('\t', '').replace(' ', '')
            # amount of trades:0
            trades = trades_line.split(':')[1]

            # profit
            # 2018-02-21 11:06:41 (INFO):     (PROFIT REPORT) simulated profit:                1.91496099 BTC (1.91316262%)
            profit_line = re.search('simulated profit:.+', result_lines).group().replace('\t', '').replace(' ', '')
            # simulated profit:1.91496099BTC(1.91316262%)
            profit_percent = re.search('\(.+\)', profit_line).group()[1:-2]
            # 1.91316262
            profit_btc = re.search(':.+BTC', profit_line).group()[1:-3]
            # 1.91496099
            return float(profit_percent), float(profit_btc), float(market_profit), float(trades)
        except Exception as e:
            print(e)
            print('result:', stdout)
            return 0, 0

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        os.remove(self.gekko_base_path + self.gekko_config_file)
