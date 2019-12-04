import { createStore, applyMiddleware, compose } from "redux";
import reduxLogger from "redux-logger";
import createSagaMiddleware from "../redux-saga";

import reducer from "./reducer";
import rootSaga from "./rootSaga";

const sagaMiddleware = createSagaMiddleware();
// redux-devTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
// , reduxLogger
const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware));
const store = createStore(reducer, enhancer);
sagaMiddleware.run(rootSaga);

export default store;
