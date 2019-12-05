import { createStore, applyMiddleware, compose } from "redux";
import reduxLogger from "redux-logger";
import createSagaMiddleware from "../redux-saga";

import reducer from "./reducer";
import rootSaga from "./rootSaga";

const sagaMiddleware = createSagaMiddleware();
// redux-devTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware)); //reduxLogger
const store = createStore(reducer, enhancer);
sagaMiddleware.run(rootSaga);
window.store = store; // 挂载到window方便调试
export default store;
