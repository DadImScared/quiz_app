import axios from "axios"
import { Question } from "../features/quizHistory/quizHistorySlice"
import shuffle from "lodash/shuffle"
import set from "lodash/set"
import { decode } from "html-entities"

export const instance = axios.create({
  baseURL: "https://opentdb.com/api.php",
})

instance.interceptors.request.use(async (config) => {
  if (!instance.defaults.params) {
    instance.defaults.params = {}
  }
  if (!instance.defaults.params.token) {
    const response = await axios.get(
      "https://opentdb.com/api_token.php?command=request"
    )
    instance.defaults.params.token = response.data.token
    set(config, "params.token", response.data.token)
  }
  return config
})

instance.interceptors.response.use((response) => {
  if (response.data.response_code > 0) {
    return Promise.reject("refresh token")
  }
  response.data.results = response.data.results.map((question: Question) => {
    return {
      ...question,
      correct_answer: decode(question.correct_answer),
      question: decode(question.question),
      incorrect_answers: shuffle([
        ...question.incorrect_answers,
        question.correct_answer,
      ]).map((answer: string) => decode(answer)),
    }
  })
  return response
})

const getQuestions = async (params: any, url = "") => {
  return await instance.get(url, { params })
}

export const getMultipleDifficultyQuiz = async (): Promise<Question[]> => {
  const easyQuestions = await getQuestions({
    amount: 5,
    difficulty: "easy",
    type: "multiple",
  })
  const mediumQuestions = await getQuestions({
    amount: 5,
    difficulty: "medium",
    type: "multiple",
  })
  const hardQuestions = await getQuestions({
    amount: 5,
    difficulty: "hard",
    type: "multiple",
  })
  return [
    ...easyQuestions.data.results,
    ...mediumQuestions.data.results,
    ...hardQuestions.data.results,
  ]
}
