import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Wallet } from 'lucide-react'
import { Loading } from './ui/loading'
import { spotTrading } from '../services/spotTrading'
interface AssetBalance {
  asset: string
  free: string
  locked: string
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
      const binanceUserAccount: any = await spotTrading.getUserAccount(currentUser.id)
      const { balances = [] } = binanceUserAccount.data
      // 只统计有余额的资产
      const balanceList = balances
        .filter((balance: any) => Number(balance.free) !== 0 || Number(balance.locked) !== 0)
        .map((balance: any) => ({
          asset: balance.asset,
          free: balance.free,
          locked: balance.locked
        }))
      setAccountAssets(balanceList)
      // 计算总资产价值
      const total = balanceList.reduce((sum: number, asset: any) => sum + Number(asset.free) + Number(asset.locked), 0)
      setTotalAssetValue(total)
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
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              <p>您还没有选择 Binance 账户</p>
              <p className="text-sm mt-2">请在顶部导航栏添加或选择一个账户</p>
            </div>
          </CardContent>
        </Card>
      </div>
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
                    <span className="font-semibold">{asset.asset}</span>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      <span>可用: {asset.free}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>冻结: {asset.locked}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {/* <p className="font-medium">{asset.usdValue.toLocaleString()} USDT</p> */}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 