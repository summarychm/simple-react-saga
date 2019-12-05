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
 * 构建callEffect对象,支持2种形态
 * call(fn, ...args) 和 call([context, fn], ...args)
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
/** 构建cpsEffect对象 支持2种形态
 * cps(fn, ...args) 和 cps([context,fn], ...args)
 * @param {function|array} fn fn或[context,fn]
 * @param  {...any} args fn参数
 */
export function cps(fn, ...args) {
	let context = null;
	if (Array.isArray(fn)) {
		// 支持context
		context = fn[0];
		fn = fn[1];
	}
	return {
		type: "CPS",
		context,
		fn,
		args,
	};
}
/**
 * all: 利用闭包+flag实现
 * @param {*} fns 要执行的generator[]
 */
export function all(fns) {
	return { type: "ALL", fns };
}

/**
 * 通过sagaMiddleware.run来生成一个新协程
 * @param {function} task saga函数
 * @param  {...any} args saga所需参数
 */
export function fork(task, ...args) {
	return { type: "FORK", task, args };
}
/**
 * 利用迭代器自身的return方法实现
 * @param {iterator} task saga对象
 */
export function cancel(task) {
	return { type: "CANCEL", task };
}

/**
 * 非阻塞take 利用 fork + while(true) + take实现
 * @param {string} actionType
 * @param {function}} saga saga函数
 * @param  {...any} args saga所需参数
 */
export function* takeEvery(actionType, saga, ...args) {
	yield fork(function*() {
		while (true) {
			yield take(actionType);
			yield fork(saga, ...args);
		}
	});
}
/**
 * 非阻塞take,只保留最后一次take,利用变量缓存迭代器对象的方式实现
 * @param {string} actionType
 * @param {function}} saga saga函数
 * @param  {...any} args saga所需参数
 */
export function* takeLatest(actionType, saga, ...args) {
	let lastTake;
	while (true) {
		yield take(actionType);
		if (lastTake) yield cancel(lastTake);
		lastTake = yield fork(saga, ...args);
	}
}
export function delay(...args) {
	return call(delayP, ...args);
}

function delayP(ms, val) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(val);
		}, ms);
	});
}
