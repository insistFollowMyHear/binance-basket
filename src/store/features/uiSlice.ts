import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  pageLoading: boolean
  loadingText: string
}

const initialState: UIState = {
  pageLoading: false,
  loadingText: '加载中...'
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload
    },
    setLoadingText: (state, action: PayloadAction<string>) => {
      state.loadingText = action.payload
    },
    startLoading: (state, action: PayloadAction<string | undefined>) => {
      state.pageLoading = true
      if (action.payload) {
        state.loadingText = action.payload
      }
    },
    stopLoading: (state) => {
      state.pageLoading = false
      state.loadingText = '加载中...'
    }
  }
})

export const { setPageLoading, setLoadingText, startLoading, stopLoading } = uiSlice.actions

export default uiSlice.reducer 