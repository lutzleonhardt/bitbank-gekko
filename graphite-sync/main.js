var firebase = require('firebase')
require('@firebase/firestore')
var graphite = require('./graphite')

var graphiteserver = 'server'
var graphiteport = 2004
var email = ''
var password = ''

var config = {
    apiKey: '',
    authDomain: 'bitbank-nz.firebaseapp.com',
    databaseURL: 'https://bitbank-nz.firebaseio.com',
    projectId: 'bitbank-nz',
    storageBucket: 'bitbank-nz.appspot.com',
    messagingSenderId: '530942804334',
}

firebase.initializeApp(config)

function getPickle(currency, asset, fs, prop) {
    // currencies.BTC.assets.ETH.indicators.bitbank.future_wstd_30
    var basePath = 'currencies.' + currency + '.assets.' + asset + '.indicators.bitbank.'
    var metric = basePath + prop
    var value = fs[ prop ]
    return graphite.toPickle(metric, value, fs.date.toString()
                                              .split('.')[ 0 ])
}

firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code
            var errorMessage = error.message
            console.log(errorCode)
            console.log(errorMessage)
        })
        .then(function (status) {
            //authenticated

            var db = firebase.firestore()
            db.collection('featuresets')
              .onSnapshot(function (querySnapshot) {
                  var pickles = ''
                  querySnapshot.forEach(function (doc) {
                      var fs = doc.data()
                      var currency_pair_split = fs.currency_pair.split('_')
                      var currency = currency_pair_split[ 0 ]
                      var asset = currency_pair_split[ 1 ]

                      var pickle = ''

                      pickle += getPickle(currency, asset, fs, 'best_ask_price')
                      pickle += getPickle(currency, asset, fs, 'best_bid_price')
                      pickle += getPickle(currency, asset, fs, 'estimated_future_wavg_120')
                      pickle += getPickle(currency, asset, fs, 'estimated_future_wavg_30')
                      pickle += getPickle(currency, asset, fs, 'estimated_future_wavg_5')
                      pickle += getPickle(currency, asset, fs, 'estimated_future_wavg_60')
                      pickle += getPickle(currency, asset, fs, 'estimated_future_wstd_120')
                      pickle += getPickle(currency, asset, fs, 'estimated_future_wstd_30')
                      pickle += getPickle(currency, asset, fs, 'estimated_future_wstd_5')
                      pickle += getPickle(currency, asset, fs, 'estimated_future_wstd_60')
                      if (fs.has_future_data) {
                          pickle += getPickle(currency, asset, fs, 'future_wavg_120')
                          pickle += getPickle(currency, asset, fs, 'future_wavg_30')
                          pickle += getPickle(currency, asset, fs, 'future_wavg_5')
                          pickle += getPickle(currency, asset, fs, 'future_wavg_60')
                          pickle += getPickle(currency, asset, fs, 'future_wstd_120')
                          pickle += getPickle(currency, asset, fs, 'future_wstd_30')
                          pickle += getPickle(currency, asset, fs, 'future_wstd_5')
                          pickle += getPickle(currency, asset, fs, 'future_wstd_60')
                      }
                      pickle += getPickle(currency, asset, fs, 'power_imbalance')
                      pickle += getPickle(currency, asset, fs, 'recommended_buy')
                      pickle += getPickle(currency, asset, fs, 'recommended_buy_profit')
                      pickle += getPickle(currency, asset, fs, 'recommended_sell')
                      pickle += getPickle(currency, asset, fs, 'recommended_sell_profit')
                      pickle += getPickle(currency, asset, fs, 'spread_percent')
                      pickle += getPickle(currency, asset, fs, 'wavg_distance_to_midpoint_percent30min')
                      pickle += getPickle(currency, asset, fs, 'wavg_distance_to_midpoint_percent5min')
                      pickle += getPickle(currency, asset, fs, 'wavg_distance_to_midpoint_percent60min')
                      pickle += getPickle(currency, asset, fs, 'weighted_trade_average30min')
                      pickle += getPickle(currency, asset, fs, 'weighted_trade_average5min')
                      pickle += getPickle(currency, asset, fs, 'weighted_trade_average60')
                      pickle += getPickle(currency, asset, fs, 'weighted_trade_r_value30min')
                      pickle += getPickle(currency, asset, fs, 'weighted_trade_r_value5min')
                      pickle += getPickle(currency, asset, fs, 'weighted_trade_r_value60')
                      pickle += getPickle(currency, asset, fs, 'weighted_trade_slope30min')
                      pickle += getPickle(currency, asset, fs, 'weighted_trade_slope5min')
                      pickle += getPickle(currency, asset, fs, 'weighted_trade_slope60')
                      pickles += pickle
                  })
                  console.log('start update cycle')
                  graphite.connect(graphiteserver, graphiteport, function (socket) {
                      graphite.sendPickles(socket, pickles, function () {
                          console.log('finish update cycle')
                          graphite.close(socket)
                      })

                  })

              }, function (error) {
                  var errorCode = error.code
                  var errorMessage = error.message
                  console.log(errorCode)
                  console.log(errorMessage)
              })
        })

