import { rest } from "msw"
import filter from "lodash/filter"

import { questions } from "./questions"

export const handlers = [
  rest.get("https://opentdb.com/api_token.php", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        response_code: 0,
        response_message: "Token Generated Successfully!",
        token:
          "19fe9954ae4968458d735618abc0ae807e54d728d5de6ae03937d594df8220c0",
      })
    )
  }),
  rest.get("https://opentdb.com/api.php", (req, res, ctx) => {
    const category = req.url.searchParams.get("category")
    const type = req.url.searchParams.get("type")
    const amount = req.url.searchParams.get("amount") || "5"
    const difficulty = req.url.searchParams.get("difficulty")
    const filterQuestions: any = {}
    if (category) {
      filterQuestions.category = category
    }
    if (type) {
      filterQuestions.type = type
    }
    if (difficulty) {
      filterQuestions.difficulty = difficulty
    }
    return res(
      ctx.status(200),
      ctx.json({
        response_code: 0,
        results: filter(questions, filterQuestions).slice(0, Number(amount)),
      })
    )
  }),
]
