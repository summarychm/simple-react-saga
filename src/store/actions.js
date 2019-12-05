import { ASYNC_INCREMENT, INCREMENT, STOP_INCREMENT, AUTO_INCREMENT } from "./action-types";
export function asyncIncrement(payload) {
	return { type: ASYNC_INCREMENT, payload };
}
export function increment(payload) {
	return { type: INCREMENT, payload };
}

export function autoIncrement(payload) {
	return { type: AUTO_INCREMENT, payload };
}
export function stopAuto(payload) {
	return { type: STOP_INCREMENT, payload };
}
