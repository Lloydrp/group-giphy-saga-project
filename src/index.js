import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, combineReducers, applyMiddleware } from "redux";
import logger from "redux-logger";
import App from "./components/App/App";
import createSagaMiddleware from "redux-saga";
import { takeEvery, put } from "redux-saga/effects";
import axios from "axios";

const middleWareSaga = createSagaMiddleware();

function* rootSaga() {
  yield takeEvery("GET_FAVORITES", getFavorites);
  yield takeEvery("SEARCH_GIF", searchGifSaga);
}

function* getFavorites(action) {
  try {
    const results = yield axios.get("/api/favorite");
    yield put({ type: "SET_FAVORITES", payload: results.data });
  } catch (error) {
    console.log("error caught in error :>> ", error);
  }
}

function* searchGifSaga(action) {
  try {
    console.log("This is action in searchGif: ", action);
    const response = yield axios.get(`/api/search/${action.payload}`);
    yield put({
      type: "SET_SEARCH_RESULTS",
      payload: response.data,
    });
    console.log("this is response in set search results: ", response);
  } catch (err) {
    console.log("Error in catch: ", err);
  }
}

function gifReducer(state = [], action) {
  if (action.type === "SET_SEARCH_RESULTS") {
    return action.payload;
  }
  return state;
}

function favoritesReducer(state = [], action) {
  if (action.type === "SET_FAVORITES") {
    return action.payload;
  }
  return state;
}

const storeInstance = createStore(
  combineReducers({
    gifReducer,
    favorites: favoritesReducer,
  }),
  applyMiddleware(logger, middleWareSaga)
);

middleWareSaga.run(rootSaga);

ReactDOM.render(
  <Provider store={storeInstance}>
    <App />
  </Provider>,
  document.getElementById("root")
);
