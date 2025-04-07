import { useEffect, useState } from 'react'

import { useSelector } from 'react-redux'
import { RootState } from '../store/store'

import { Wallet } from 'lucide-react'
import { Loading } from './ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

import { spotTrading } from '../services/spotTrading'

import { NoData } from './NoData'

interface AssetBalance {
  asset: string
  free: string
  locked: string,
  iconUrl: string
  usdtValue: number
}

export function UserProfile() {
  const [loading, setLoading] = useState(true)
  const [totalAssetValue, setTotalAssetValue] = useState(0)
  const [accountAssets, setAccountAssets] = useState<AssetBalance[]>([])
  const currentUser = useSelector((state: RootState) => state.auth.currentUser)

  useEffect(() => {
    if (currentUser?.id) {
      loadUserAccount()
    } else {
      setLoading(false)
    }
  }, [currentUser])

  const loadUserAccount = async () => {
    try {
      // 获取账户信息和所有交易对价格
      const [accountResponse, tickersResponse] = await Promise.all([
        spotTrading.getUserAccount(currentUser.id),
        spotTrading.getAllTickers(currentUser.id)
      ])

      const { balances = [] } = accountResponse.data
      const tickers = tickersResponse.data || []

      // 创建价格映射
      const priceMap: { [key: string]: number } = {}
      tickers.forEach((ticker: any) => {
        priceMap[ticker.symbol] = parseFloat(ticker.lastPrice)
      })

      // 处理资产数据
      const balanceList = balances
        .filter((balance: any) => Number(balance.free) !== 0 || Number(balance.locked) !== 0)
        .map((balance: any) => {
          const { asset, free, locked } = balance
          const total = Number(free) + Number(locked)
          
          // 计算USDT估值
          let usdtValue = 0
          if (asset === 'USDT') {
            usdtValue = total
          } else {
            // 尝试直接用XXX/USDT的价格
            const directPair = `${asset}USDT`
            if (priceMap[directPair]) {
              usdtValue = total * priceMap[directPair]
            } else {
              // 如果没有直接对USDT的交易对，尝试通过BTC中转
              const btcPair = `${asset}BTC`
              const btcUsdt = priceMap['BTCUSDT']
              if (priceMap[btcPair] && btcUsdt) {
                usdtValue = total * priceMap[btcPair] * btcUsdt
              }
            }
          }

          return {
            asset,
            free,
            locked,
            usdtValue: parseFloat(usdtValue.toFixed(2)),
            iconUrl: `https://assets.coincap.io/assets/icons/${asset.toLowerCase()}@2x.png`
          }
        })

      setAccountAssets(balanceList)

      // 计算总USDT估值
      const totalUsdt = balanceList.reduce((sum: number, asset: any) => sum + asset.usdtValue, 0)
      setTotalAssetValue(totalUsdt)
    } catch (error) {
      console.error('获取用户账户失败', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!currentUser?.id) {
    return (
      <NoData />
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 资产概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            资产概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">总资产估值 (USDT)</p>
              <p className="text-2xl font-bold">{totalAssetValue.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">资产数量</p>
              <p className="text-2xl font-bold">{accountAssets.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 资产列表 */}
      <Card>
        <CardHeader>
          <CardTitle>资产明细</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 一行4个， 适配不同屏幕*/}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 ">
            {accountAssets.map((asset) => (
              <div key={asset.asset} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-12 flex items-center justify-center">
                    {/* <span className="font-semibold">{asset.asset}</span> */}
                    <img 
                      src={asset.iconUrl} 
                      alt={asset.asset}
                      className="h-8 w-8"
                      onError={(e) => {
                        // 如果图片加载失败，显示币种文字
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as any).nextSibling!.style.display = 'block';
                      }}
                    />
                    <span className="font-semibold hidden">{asset.asset}</span>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      <span>可用: {Number(asset.free).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>冻结: {Number(asset.locked).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {/* <p className="font-medium">{asset.usdtValue.toLocaleString()} USDT</p> */}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 