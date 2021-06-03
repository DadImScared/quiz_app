import {
  getDefaultNormalizer,
  render,
  screen,
  Matcher,
} from "@testing-library/react"
import { ThemeProvider } from "@material-ui/core/styles"
import { Provider } from "react-redux"

import theme from "../app/theme"
import { reducer } from "../app/store"
import { configureStore } from "@reduxjs/toolkit"

const customRender = (
  ui: any,
  {
    preloadedState = {},
    store = configureStore({ reducer, preloadedState }),
    ...renderOptions
  } = {} as any
) => {
  function Providers({ children }: any) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    )
  }

  return render(ui, { wrapper: Providers, ...renderOptions })
}

export const getWrongAnswer = (
  correctAnswer: string,
  wrongAnswers: string[]
) => {
  return wrongAnswers.find((answer) => answer !== correctAnswer)
}

export const makeStore = (preloadedState = {}) =>
  configureStore({ reducer, preloadedState })

export const getByTextNoTrim = (text: Matcher): any => {
  return screen.getByText(text, {
    normalizer: getDefaultNormalizer({ trim: false }),
  })
}
export const findByTextNoTrim = (text: Matcher): any => {
  return screen.findByText(text, {
    normalizer: getDefaultNormalizer({ trim: false }),
  })
}
// re-export everything
export * from "@testing-library/react"

// override render method
export { customRender as render }
