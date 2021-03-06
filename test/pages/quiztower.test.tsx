import { rest } from "msw"
import { setupServer } from "msw/node"
import { cache } from "swr"
import "@testing-library/jest-dom/extend-expect"

import {
  render,
  waitFor,
  getByTextNoTrim,
  fireEvent,
  findByTextNoTrim,
  makeStore,
  getWrongAnswer,
} from "../testUtils"
import { getFilteredQuestions, handlers } from "../handlers"
import QuizTower from "../../pages/quiztower"
import { getMultipleDifficultyQuiz } from "../../app/quizApi"
import { quizTowerSecondQuestionSet } from "../questions"

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => {
  cache.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe("quiz tower", () => {
  it("should render questions and answer choices", async () => {
    const questions = await getMultipleDifficultyQuiz()
    render(<QuizTower />)
    await waitFor(() => {
      // only first question should be visible
      expect(getByTextNoTrim(questions[0].question)).toBeVisible()

      questions.slice(1).forEach((question) => {
        expect(getByTextNoTrim(question.question)).not.toBeVisible()
      })
    })
  })

  it("should show next question after selecting the right answer on the first question", async () => {
    const questions = await getMultipleDifficultyQuiz()
    const { findByRole } = render(<QuizTower />)
    expect(await findByTextNoTrim(/1 \/ 15/)).toBeVisible()
    fireEvent.click(
      await findByRole("button", { name: questions[0].correct_answer })
    )
    expect(await findByTextNoTrim(questions[1].question)).toBeVisible()
    expect(await findByTextNoTrim(questions[0].question)).not.toBeVisible()
    expect(await findByTextNoTrim(/2 \/ 15/)).toBeVisible()
  })

  it("should save quiz and show try again message when selecting the wrong answer", async () => {
    Date.now = jest.fn(() => 12345)
    const store = makeStore()
    const questions = await getMultipleDifficultyQuiz()
    const { findByRole, queryByRole, queryByText } = render(<QuizTower />, {
      store,
    })
    const wrongAnswer = getWrongAnswer(
      questions[0].correct_answer,
      questions[0].incorrect_answers
    )
    expect(queryByRole("alert")).not.toBeInTheDocument()
    fireEvent.click(await findByRole("button", { name: wrongAnswer }))
    expect(await findByRole("alert")).toHaveTextContent(
      "Game over you answered 1 out of 15 questions correct"
    )
    expect(queryByText(/1 \/ 15/)).not.toBeInTheDocument()
    expect(store.getState().quizHistory[12345][0].selectedAnswer).toEqual(
      wrongAnswer
    )
  })

  it("should fetch new questions when play again is clicked", async () => {
    const questions = await getMultipleDifficultyQuiz()
    const { findByRole } = render(<QuizTower />)
    fireEvent.click(
      await findByRole("button", { name: questions[0].correct_answer })
    )
    fireEvent.click(
      await findByRole("button", { name: questions[1].correct_answer })
    )
    fireEvent.click(
      await findByRole("button", { name: questions[2].correct_answer })
    )

    const wrongAnswer = getWrongAnswer(
      questions[3].correct_answer,
      questions[3].incorrect_answers
    )
    fireEvent.click(await findByRole("button", { name: wrongAnswer }))
    server.use(
      rest.get(
        "https://opentdb.com/api.php",
        getFilteredQuestions([...quizTowerSecondQuestionSet])
      )
    )
    fireEvent.click(await findByRole("button", { name: "Play again" }))
    expect(await findByTextNoTrim(/1 \/ 15/)).toBeVisible()
    const newQuestions = await getMultipleDifficultyQuiz()
    expect(getByTextNoTrim(newQuestions[0].question)).toBeVisible()
    newQuestions.slice(1).forEach((question) => {
      expect(getByTextNoTrim(question.question)).not.toBeVisible()
    })
  })

  it("should show congrats message on win", async () => {
    Date.now = jest.fn(() => 12345)
    const store = makeStore()
    const questions = await getMultipleDifficultyQuiz()
    const { findByRole } = render(<QuizTower />, { store })
    for (const question of questions) {
      fireEvent.click(
        await findByRole("button", { name: question.correct_answer })
      )
    }
    expect(await findByRole("alert")).toHaveTextContent(
      "Congratulations you answered all questions correct!"
    )
    const questionHistory = store.getState().quizHistory[12345]
    questions.forEach((question, index) => {
      expect(questionHistory[index].selectedAnswer).toEqual(
        question.correct_answer
      )
    })
  }, 30000)
})
