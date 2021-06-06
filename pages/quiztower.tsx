import React, { useState } from "react"
import {
  Container,
  Paper,
  Grid,
  Fade,
  makeStyles,
  Button,
} from "@material-ui/core"
import { Alert } from "@material-ui/lab"
import useSWR from "swr"

import { getMultipleDifficultyQuiz } from "../app/quizApi"
import { Question, saveQuiz } from "../features/quizHistory/quizHistorySlice"
import { useAppDispatch } from "../common/hooks"

const fetcher = async () => await getMultipleDifficultyQuiz()

const useStyles = makeStyles({
  gridContainer: {
    display: "grid",
  },
  gridItem: {
    gridColumn: "1 / 1",
    gridRow: "1 / 1",
  },
  answer: {
    justifyContent: "flex-start",
  },
})

enum QuizStatus {
  Playing,
  Lost,
  Won,
}

function QuizTower(): JSX.Element {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [quizStatus, setQuizStatus] = useState<QuizStatus>(0)
  const { data } = useSWR("/multipleDifficultyQuiz", fetcher, {
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const endQuiz = (status: QuizStatus) => {
    dispatch(saveQuiz({ timestamp: Date.now(), questions: data as Question[] }))
    if (status === QuizStatus.Lost) {
      setQuizStatus(QuizStatus.Lost)
    } else {
      setQuizStatus(QuizStatus.Won)
    }
  }

  const selectAnswer = async (answer: string) => {
    if (!data) return
    const { correct_answer: correctAnswer } = data[currentQuestion]
    data[currentQuestion].selectedAnswer = answer
    if (answer !== correctAnswer) {
      endQuiz(QuizStatus.Lost)
      return
    }
    if (currentQuestion === data.length - 1) {
      endQuiz(QuizStatus.Won)
      return
    }
    setCurrentQuestion((prevState) => prevState + 1)
  }

  const showAnswers = (answers: string[]) => {
    return (
      <Grid container item spacing={4}>
        {answers.map((answer) => {
          return (
            <Grid item xs={12} md={6} key={answer}>
              <Paper>
                <Button
                  onClick={() => selectAnswer(answer)}
                  fullWidth
                  className={classes.answer}
                >
                  <span>{answer}</span>
                </Button>
              </Paper>
            </Grid>
          )
        })}
      </Grid>
    )
  }

  if (!data) return <Container>Loading</Container>

  return (
    <Container>
      {quizStatus === QuizStatus.Playing ? (
        <>
          <div>
            current question {currentQuestion + 1} / {data.length}
          </div>
          <div className={classes.gridContainer}>
            {data.map((question: Question, index) => {
              return (
                <Fade
                  timeout={800}
                  in={currentQuestion === index}
                  key={question.question}
                  style={{ zIndex: 55 - index }}
                >
                  <div className={classes.gridItem}>
                    <Grid container>
                      <Grid item>
                        <p style={{ height: "70px" }}>{question.question}</p>
                      </Grid>
                      {showAnswers(question.incorrect_answers)}
                    </Grid>
                  </div>
                </Fade>
              )
            })}
          </div>
        </>
      ) : (
        <Alert
          variant="filled"
          severity={quizStatus === QuizStatus.Won ? "success" : "error"}
        >
          {quizStatus === QuizStatus.Won
            ? "Congratulations you answered all questions correct!"
            : `Game over you answered ${currentQuestion + 1} out of ${
                data.length
              } questions correct`}
        </Alert>
      )}
    </Container>
  )
}

export default QuizTower
