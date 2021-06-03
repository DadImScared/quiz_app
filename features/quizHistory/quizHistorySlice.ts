import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface Question {
  question: string
  incorrect_answers: string[]
  correct_answer: string
  type: "multiple" | "boolean"
  difficulty: "easy" | "medium" | "hard"
  category: string
  selectedAnswer?: string
}

interface SaveQuizPayload {
  timestamp: number
  questions: Question[]
}

interface QuizHistoryState {
  [key: number]: Question[]
}

const initialState: QuizHistoryState = {}

const quizHistorySlice = createSlice({
  name: "quizHistory",
  initialState,
  reducers: {
    saveQuiz: (state, { payload }: PayloadAction<SaveQuizPayload>) => {
      state[payload.timestamp] = payload.questions
    },
  },
})

export const { saveQuiz } = quizHistorySlice.actions

export default quizHistorySlice.reducer
