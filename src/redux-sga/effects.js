/**
 * 构建takeEffect对象
 * @param {string} actionType
 */
export function take(actionType) {
	return { type: "TAKE", actionType };
}
/**
 * 构建putEffect对象
 * @param {object} action reduxAction
 */
export function put(action) {
	return { type: "PUT", action };
}
