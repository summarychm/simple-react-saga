/**  
  
 */

const EventEmitter = require("events");

/** 创建一个saga中间件,并在其上挂载run方法,用于创建协程. */
export default function createSagaMiddleware() {
	const events = new EventEmitter();
	let sagaMiddleware = ({ getState, dispatch }) => {
		/** 开启一个新的generator协程
		 * @param {generator/function} gen 要执行的generator对象(或生成generator的fn)
		 */
		function run(gen) {
			// 如果 gen 为生成器函数,则取其返回值
			const it = typeof gen === "function" ? gen() : gen;
			// generator 自执行器
			function next(val) {
				const { value: result, done } = it.next(val);
				if (done) return;

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
							//? 这里为什么一定是promise?
							fn.apply(context, args).then(next);
							break;
						case "FORK":
							// 使用run开启一个协程运行传入的generator
							run(effect.task);
							next(); // 继续向下执行gen函数(同步)
							break;
						default:
							break;
					}
				}
			}
			next(); // 启动自执行器
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