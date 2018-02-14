# BitBank-Gekko

Strategy plugin for [gekko] using the excellent AI based High quality live coin predictions API [BitBank.nz].
Live / Paper trading via [REST API] and backtesting via CSV-based prediction data possible (see [here] how to export data from Google BigQuery).

 ## Installation
* clone repo
* npm install
* npm run build

Copy over these 2 files from the dist directory:
* dist/BitBankStrategy.js to gekko/strategies
* dist/BitBankStrategy.toml to gekko/config/strategies

## toml config file

```
# API key for BitBank.nz predition data
apiKey = "API-KEY"
# currency-pair for which we wand predition data for
pair = "BTC_ETH"
# when prediction featureset is older than 60s it's not used by the strategy
maxFeatureSetAgeInSeconds = 60
# time period for getting new candles (1 min is the minimum)
candlePeriodInMinutes = 1

[backTest]
# enable backtesting 
enable = true
# path to the exported CSV (export has to be ordered by date field)
csvPath = "/mnt/d/BitBank/BTC_ETH.csv"

```

License
----
MIT

**Free Software**


  [gekko]: <http://gekko.wizb.it>
  [BitBank.nz]: <https://bitbank.nz/>
  [REST API]: <https://bitbank.nz/api>
  [here]: <http://blog.bitbank.nz/backtesting-cryptocurrency-trading-with-bigquery/>