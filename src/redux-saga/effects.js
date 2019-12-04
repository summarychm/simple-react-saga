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

/**
 * 构建callEffect对象
 * @param {function} fn 要调用的fn
 * @param  {...any} args 调用fn时的参数
 */
export function call(fn, ...args) {
	let context = null;
	if (Array.isArray(fn)) {
		context = fn[0];
		fn = fn[1];
	}
	return { type: "CALL", payload: { fn, context, args } };
}

export function fork(task) {
	return { type: "FORK", task };
}

export function* takeEvery(actionType, task) {
	// fork + while(true) + take
	yield fork(function*() {
		while (true) {
			yield take(actionType);
			yield task(); // 继续向下执行 不应该用call?
		}
	});
}
function delayP(ms, val) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(val);
		}, ms);
	});
}

export function delay(...args) {
	return call(delayP, ...args);
}
