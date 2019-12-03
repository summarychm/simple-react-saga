import { ASYNC_INCREMENT, INCREMENT } from "./action-types";
export function asyncIncrement(payload) {
	return { type: ASYNC_INCREMENT, payload };
}
export function increment(payload) {
	return { type: INCREMENT, payload };
}
