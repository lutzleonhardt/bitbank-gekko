import { expect } from 'chai'
import 'mocha'
import * as path from 'path'
import { CsvReader } from './CsvReader'

describe('CsvReader', () => {

    it('should return the correct featureset by date', async () => {
        let filePath = __dirname.split(path.sep)
        filePath.pop()
        filePath.pop()
        filePath.pop()
        filePath.push('test-data')
        filePath.push('bitbank-btc_eth.csv')
        const csvPath = filePath.join(path.sep)
        const csvReader = new CsvReader(csvPath, 'BTC_ETH')

        // no entry for this date available
        let emptyFeatureset = await csvReader.getNextFeaturesetAsync(new Date('2018-01-01 21:06:22.335692 UTC'))
        console.log(emptyFeatureset)
        expect(emptyFeatureset).to.be.null

        // no entry for this date available
        emptyFeatureset = await csvReader.getNextFeaturesetAsync(new Date('2018-01-05 21:06:22.335692 UTC'))
        console.log(emptyFeatureset)
        expect(emptyFeatureset).to.be.null

        // looking for the first line
        // 33769960,0.090308168404998876,2.7578285259391623e-06,0,-0.00077065669950261663,0.0903636778278808,3.7227555023088461e-07,0,-0.00015589418733084461,0.089991111499191145,1.3986421667206736e-07,0,-0.0042965743434820085,1.0049300359057287,1.0008133754655175,BTC_ETH,2018-01-17
        // 20:53:53.150104 UTC,2018-01-17 20:53:51.243474
        // UTC,0.08958517988515366,0.0006936517874803472,0.09114348434031785,0.0006175213072798753,0.09165973267018328,0.0005562734928420615,0.09216711825946176,0.0011853681627557555,1,0.0906,0.09015553,0.9989593310950291,1.0024069163440219,1.0030732398495643,1.0019037125246857,0.089136350988797866,0.092240326355678109,1.0104588543809543,1.0140613427753131
        // date: 2018-01-17 20:53:51.243474 UTC
        const firstFeatureset = await csvReader.getNextFeaturesetAsync(new Date('2018-01-17 20:53:51.243474 UTC'))
        console.log(firstFeatureset)
        expect(firstFeatureset.id)
            .to
            .equal(33769960)

        // looking for this line
        //33773723,0.090003140161036249,-9.51111730276446e-07,0,-0.0028422879302437815,0.09027764701560842,-3.3616476668977347e-06,0,0.00020705031894757198,0.090224008520896723,2.6321820138065622e-07,0,-0.00038733015387123847,1.0002534141658408,1.0016869473463597,BTC_ETH,2018-01-17
        // 21:06:24.543210 UTC,2018-01-17 21:06:22.335692
        // UTC,0.0909392787983617,0.0005887000733996676,0.09145772379016842,0.0005780468197147631,0.09240779845772945,0.0006942978623465904,0.09131364653009626,0.0013721704634932375,1,0.09027039,0.09024752,1.0034077977635716,1.0003670266400764,0.99832262271280836,0.996980561404705,0.088859102773491225,0.091951037877354688,1.0104588540272579,1.0140613424294389
        // date: 2018-01-17 21:06:22.335692 UTC
        const featureset1 = await csvReader.getNextFeaturesetAsync(new Date('2018-01-17 21:06:22.335692 UTC'))
        console.log(featureset1)
        expect(featureset1.id)
            .to
            .equal(33773723)

        // looking for this line
        //33775445,0.091323558051032441,-9.67094657476391e-06,0,0.0025211791562454382,0.0911619149470035,3.1265384112419306e-06,0,0.0007525066475772504,0.090645201651318952,8.1529370845727518e-07,0,-0.0049435970191207121,1.0013361162222283,0.9975738628405546,BTC_ETH,2018-01-17
        // 21:10:44.052772 UTC,2018-01-17 21:10:42.378834
        // UTC,0.09096448638664907,0.0005707385026922452,0.091534654819524,0.0005508249515260665,0.09257887717829193,0.0006637643523369243,0.09096449291782098,0.0013745147647592315,1,0.09115413,0.0910325,0.99990014405551442,0.99705356945014212,0.99627496969499418,0.99395021509361958,0.089414446581404544,0.092531195506924069,1.0104588547335283,1.0140613431208965
        // date: 2018-01-17 21:10:42.378834 UTC
        const featureset2 = await csvReader.getNextFeaturesetAsync(new Date('2018-01-17 21:10:42.378834 UTC'))
        console.log(featureset2)
        expect(featureset2.id)
            .to
            .equal(33775445)

        // looking for the last entry
        // Date: 2018-01-17 21:14:36.922600 UTC
        // 33776894,0.09118807012839146,-1.0015170602976613e-07,0,-0.0031464628125649208,0.09103891206231024,2.076795902234191e-06,0,-0.0047900170137281407,0.090712611162155413,8.1239524222700911e-07,0,-0.0084043313060604731,1.0003280122816545,0.99810039627003666,BTC_ETH,2018-01-17
        // 21:14:39.228702 UTC,2018-01-17 21:14:36.922600
        // UTC,0.09103078191597588,0.0005901408778070504,0.09154543858379996,0.0005486634839516674,0.0927472700224756,0.0006483440864925148,0.090531495381642,0.0011263834716108913,1,0.09148999,0.09145999,0.99480109230800018,0.99983403981697061,0.998737154505734,0.99758109887752011,0.08987005650645162,0.093005437286472245,1.0104588553064417,1.0140613436797106
        const lastFeatureset = await csvReader.getNextFeaturesetAsync(new Date('2018-01-17 21:14:36.922600 UTC'))
        console.log(lastFeatureset)
        expect(lastFeatureset.id)
            .to
            .equal(33776894)

        // looking for date after the last entry; should be return the last recent one
        let afterLastFeatureset = await csvReader.getNextFeaturesetAsync(new Date('2018-01-18 18:14:36.922600 UTC'))
        console.log(afterLastFeatureset)
        expect(afterLastFeatureset.id)
            .to
            .equal(33776894)

        // looking for date after the last entry; should be return the last recent one
        afterLastFeatureset = await csvReader.getNextFeaturesetAsync(new Date('2018-01-19 22:14:36.922600 UTC'))
        console.log(afterLastFeatureset)
        expect(afterLastFeatureset.id)
            .to
            .equal(33776894)

        csvReader.dispose()
    })

})