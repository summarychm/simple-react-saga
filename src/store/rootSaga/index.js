import { ASYNC_INCREMENT } from "../action-types";
import { increment } from "../actions";
import { take, put, delay } from "redux-saga/effects";
export default function* rootSaga() {
	console.log("rootSaga run!");
	for (let i = 0; i < 3; i++) {
		yield take(ASYNC_INCREMENT);
		const value = yield delay(500, 10);
		yield put(increment(value));
	}
}
