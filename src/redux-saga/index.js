/**  
  
 */

const EventEmitter = require("events");

/** 创建一个saga中间件,并在其上挂载run方法,用于创建协程. */
export default function createSagaMiddleware() {
	const events = new EventEmitter();
	/** 检测函数执行次数,到达目标次数执行回调
	 * @param {function} cb 执行完毕回调
	 * @param {number} total 目标执行次数
	 */
	function times(cb, total) {
		let count = 0;
		return () => {
			if (++count === total) cb && cb();
		};
	}

	let sagaMiddleware = ({ getState, dispatch }) => {
		/** 开启一个新的generator协程
		 * @param {generator/function} gen 要注册的generator对象(或生成generator的fn)
		 * @param {function} callback 协程开启完毕回调
		 */
		function run(gen, callback) {
			// 如果 gen 为生成器函数,则取其返回值
			const it = typeof gen === "function" ? gen() : gen;
			// generator 自执行函数
			function next(val) {
				const { value: result, done } = it.next(val);
				// 如果协程注册完毕,则执行回调
				if (done) return callback && callback();

				if (typeof result[Symbol.iterator] === "function") {
					// 如果result有遍历器属性,则使用run开启子协程,子协程有自己的流程控制.
					run(result);
					next(); // 继续向下执行gen函数(同步)
				} else if (result.then) {
					// 如果result是promise,则注册then回调,在回调中继续向下执行gen函数(异步)
					result.then(next);
				} else {
					// 还有可能是 generatorAry
					// 剩余情况皆认为是saga的effect对象,根据effectType来判断执行什么逻辑.
					const effect = result;
					switch (effect.type) {
						case "TAKE":
							// 创建一个新订阅,actionType为key,执行器next函数为value
							// 暂停generator的执行,直到触发event时继续generator执行
							events.once(effect.actionType, next);
							break;
						case "PUT":
							dispatch(effect.action); // 调用dispatch派发action
							next(); // 继续向下执行gen函数(同步)
							break;
						case "CALL":
							const { fn, args, context } = effect.payload;
							// 使用Promise包裹,方便回调
							Promise.resolve(fn.apply(context, args)).then(next);
							break;
						case "FORK":
							// 使用run开启一个协程运行传入的generator
							run(effect.task);
							next(); // 继续向下执行gen函数(同步)
							break;
						case "CPS":
							const { fn: cbFn, args: cbArgs, context: cbContext } = effect;
							// 将自执行器的next作为callback传入,在node风格函数执行完毕后执行next回调
							cbFn.apply(cbContext, [...cbArgs, next]);
							break;
						case "ALL":
							const { fns } = effect;
							const doneFn = times(next, fns.length);
							for (let i = 0; i < fns.length; i++) {
								const fn = fns[i];
								run(fn, doneFn);
							}
							break;
						default:
							break;
					}
				}
			}
			next(); // 启动generator自执行函数
		}
		sagaMiddleware.run = run; // 将开启协程的方法挂载到saga中间件上

		// sagaMiddleware核心功能(2件事)
		return (next) => (action) => {
			events.emit(action.type, action); // 1.将actionType作为key来emit.
			return next(action); // 2.交由后续中间件继续处理(因无法确地当前action是专门用于saga的,没有明确特征)
		};
	};

	return sagaMiddleware;
}
