import { ASYNC_INCREMENT } from "../action-types";
import { increment } from "../actions";
import { take, put } from "../../redux-sga/effects";
export default function* rootSaga() {
	console.log("rootSaga run!");
	for (let i = 0; i < 3; i++) {
		yield take(ASYNC_INCREMENT);
		// const value = yield delay(500, 10);
		const value = 50;
		yield put(increment(value));
	}
	console.error("只能调用ASYNC_INCREMENT 3次!");
}
