import { configureStore } from "@reduxjs/toolkit"
import quizHistoryReducer from "../features/quizHistory/quizHistorySlice"

export const reducer = {
  quizHistory: quizHistoryReducer,
}

export const store = configureStore({
  reducer,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
