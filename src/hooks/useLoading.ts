import { useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "../store/store"
import { startLoading, stopLoading, setLoadingText } from "../store/features/uiSlice"

export const useLoading = () => {
  const dispatch = useDispatch()
  const { pageLoading, loadingText } = useSelector((state: RootState) => state.ui)

  const showLoading = useCallback((text?: string) => {
    dispatch(startLoading(text))
  }, [dispatch])

  const hideLoading = useCallback(() => {
    dispatch(stopLoading())
  }, [dispatch])

  const updateLoadingText = useCallback((text: string) => {
    dispatch(setLoadingText(text))
  }, [dispatch])

  /**
   * 执行一个异步操作并自动处理加载状态
   * @param asyncFn 异步函数
   * @param loadingMessage 可选的加载消息
   * @returns 异步函数的结果
   */
  const withLoading = useCallback(
    async <T,>(asyncFn: () => Promise<T>, loadingMessage?: string): Promise<T> => {
      try {
        showLoading(loadingMessage)
        return await asyncFn()
      } finally {
        hideLoading()
      }
    },
    [showLoading, hideLoading]
  )

  return {
    pageLoading,
    loadingText,
    showLoading,
    hideLoading,
    updateLoadingText,
    withLoading
  }
} 