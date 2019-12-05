/*
yield后的对象会传给sagaMiddleware中的run函数.
*/

import { ASYNC_INCREMENT, STOP_INCREMENT, AUTO_INCREMENT } from "../action-types";
import { increment } from "../actions";
import { all, take, takeEvery, put, call, delay, cps, fork, cancel } from "../../redux-saga/effects";

const delayCallback = (ms, callback) => {
	setTimeout(() => {
		callback && callback(null, "ok");
	}, ms);
};

function* incrementFn() {
	yield delay(500, 555);
	yield put(increment());
}
function* autoIncrement() {
	const taskGen = yield fork(function* auto() {
		while (true) {
			yield cps([null, delayCallback], 1000);
			yield put(increment());
		}
	});
	yield take(STOP_INCREMENT);
	yield cancel(taskGen);
	console.log("cancel Task");
}
function* helloSaga() {
	yield call(console.log, "rootSaga run!");
}
function* incrementWatcher() {
	yield takeEvery(ASYNC_INCREMENT, incrementFn);
	yield takeEvery(AUTO_INCREMENT, autoIncrement);
}
export default function* rootSaga() {
	yield all([incrementWatcher(), helloSaga()]);
}
