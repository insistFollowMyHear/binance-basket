import { Card, CardContent } from "./ui/card"

export function NoData({ text, description }: { text?: string, description?: string }) {
  const _text = text || '您还没有选择 Binance 账户'
  const _description = description || '请在顶部导航栏添加或选择一个账户'

  return (
    <div className="container mx-auto p-6 mt-10">
      <Card>
        <CardContent className="py-10">
          <div className="text-center text-muted-foreground">
            <p>{_text}</p>
            <p className="text-sm mt-2">{_description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
