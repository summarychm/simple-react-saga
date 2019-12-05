/*
yield后的对象会传给sagaMiddleware中的run函数.
*/
import { ASYNC_INCREMENT, STOP_INCREMENT } from "../action-types";
import { increment } from "../actions";
// import { take, put } from "redux-saga/effects";
import { take, put, takeEvery, call, delay, cps, all, fork, cancel } from "../../redux-saga/effects";

const delayCallback = (ms, callback) => {
	setTimeout(() => {
		callback && callback("ok");
	}, ms);
};
export function* incrementFn() {
	while (true) {
		yield delay(500, 555);
		// yield cps([null, delayCallback], 500);
		yield put(increment());
	}
}

function* helloSaga() {
	yield call(console.log, "rootSaga run!");
}
function* incrementWatcher() {
	// takeEvery(ASYNC_INCREMENT, incrementFn);
	const taskGen = yield fork(incrementFn);
	yield take(STOP_INCREMENT);
	yield cancel(taskGen);
}
export default function* rootSaga() {
	yield all([incrementWatcher(), helloSaga()]);
}
