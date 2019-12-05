import { ASYNC_INCREMENT, INCREMENT, STOP_INCREMENT } from "./action-types";
export function asyncIncrement(payload) {
	return { type: ASYNC_INCREMENT, payload };
}
export function increment(payload) {
	return { type: INCREMENT, payload };
}
export function stop(payload) {
	return { type: STOP_INCREMENT, payload };
}
