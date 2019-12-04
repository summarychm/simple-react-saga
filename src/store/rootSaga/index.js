/*
yield后的对象会传给sagaMiddleware中的run函数.
*/
import { ASYNC_INCREMENT } from "../action-types";
import { increment } from "../actions";
// import { take, put } from "redux-saga/effects";
import { take, put, takeEvery, call, delay } from "../../redux-saga/effects";

export function* incrementFn() {
	yield delay(500, 555);
	yield put(increment());
}
export default function* rootSaga() {
	yield call(console.log, "rootSaga run!");
	yield takeEvery(ASYNC_INCREMENT, incrementFn);

	// for (let i = 0; i < 3; i++) {
	// 	yield take(ASYNC_INCREMENT);
	// 	// const value = yield delay(500, 10);
	// 	// yield put(increment(value));

	// 	yield incrementFn();
	// }
	// console.error("只能调用ASYNC_INCREMENT 3次!");
}
