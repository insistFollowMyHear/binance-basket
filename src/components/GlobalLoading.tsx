import { useSelector } from 'react-redux'
import { RootState } from '../store/store'
import { Loading } from './ui/loading'

export function GlobalLoading() {
  const { pageLoading, loadingText } = useSelector((state: RootState) => state.ui)

  if (!pageLoading) {
    return null
  }

  return (
    <Loading fullScreen size="lg" text={loadingText} />
  )
} 