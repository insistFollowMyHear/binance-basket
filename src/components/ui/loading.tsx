import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  className?: string
}

export function Loading({ 
  size = 'md', 
  text = '加载中...', 
  fullScreen = false,
  className 
}: LoadingProps) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const loadingContent = (
    <div className={cn(
      "flex items-center justify-center space-y-2",
      className
    )}>
      <Loader2 className={cn("animate-spin text-primary", sizeMap[size])} />
      {text && <p className="text-sm text-muted-foreground" style={{ marginTop: '0px' }}>{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {loadingContent}
      </div>
    )
  }

  return loadingContent
} 