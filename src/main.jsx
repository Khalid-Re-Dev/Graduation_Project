import React from "react"
import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import store from "./store/store"
import HttpInterceptor from "./components/HttpInterceptor"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <HttpInterceptor />
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)

