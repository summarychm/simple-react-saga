const EventEmitter = require("events");

/** 创建一个saga中间件,并在其上挂载run方法,用于创建协程. */
export default function createSagaMiddleware() {
	const events = new EventEmitter();

	let sagaMiddleware = ({ getState, dispatch }) => {
		/** 开启一个新的generator协程
		 * @param {generator/function} gen 要开启的generator对象(或生成generator的fn)
		 * @param {function} callback 协程开启完毕回调
		 */
		function run(gen, callback) {
			// 如果 gen 为生成器函数,则取其返回值
			const it = typeof gen === "function" ? gen() : gen;

			// generator 自执行函数
			function next(val) {
				const { value: result, done } = it.next(val);
				// 如果协程开启完毕,则执行回调
				if (done) return callback && callback();

				if (typeof result[Symbol.iterator] === "function") {
					// 如果result有遍历器属性,则使用run继续开启子协程.
					run(result);
					next(); // 继续向下执行gen函数(同步)
				} else if (result.then) {
					// 如果result是promise,则注册then回调,在回调中继续向下执行gen函数(异步)
					result.then(next);
				} else {
					// 剩余情况皆认为是saga的effect对象,根据effectType执行不同逻辑.
					const effect = result;
					switch (effect.type) {
						case "TAKE":
							// 创建一个新订阅,actionType为key,执行器next函数为value(阻塞)
							// 暂停generator的执行,直到触发event时继续generator执行
							events.once(effect.actionType, next);
							break;
						case "PUT":
							dispatch(effect.action); // 调用dispatch派发action
							next(); // 继续向下执行gen函数(同步)
							break;
						case "CALL":
							const { fn, args, context } = effect.payload;
							// 使用Promise包裹,方便注册回调
							Promise.resolve(fn.apply(context, args)).then(next);
							break;
						case "CPS":
							const { fn: cbFn, args: cbArgs, context: cbContext } = effect;
							// 将自执行器的next作为callback传入,在node风格函数执行完毕后执行next回调
							cbFn.apply(cbContext, [
								...cbArgs,
								function(err, value) {
									if (arguments.length === 1) it.throw("callback回调参数必须大于1个");
									if (err) return it.return("发生错误!");
									next(value);
								},
							]);
							break;
						case "ALL":
							const { fns } = effect;
							const doneFn = fnCallCheck(next, fns.length); // 定义done事件,用于回调
							for (let i = 0; i < fns.length; i++) {
								const fn = fns[i];
								run(fn, doneFn);
							}
							break;
						case "FORK":
							const { task: forkTask, args: forkArgs } = effect;
							let newTask = forkTask(forkArgs); // 使用run开启新协程
							run(newTask);
							next(newTask); // 继续向下执行gen函数(同步)
							break;
						case "CANCEL":
							const canVal = effect.task.return("over");
							next(canVal); // 利用迭代器对象的return方法.
							break;
						default:
							break;
					}
				}
				// TODO 还有可能是 generatorAry
			}
			next(); // 启动generator自执行函数
		}
		sagaMiddleware.run = run; // 将开启协程的方法挂载到saga中间件上

		// sagaMiddleware核心功能(负责2件事)
		return (next) => (action) => {
			events.emit(action.type, action); // 1.将actionType作为key来emit.
			return next(action); // 2.交由后续中间件继续处理(因无法确地当前action是专门用于saga的,没有明确特征)
		};
	};

	return sagaMiddleware;
}

/** 检测函数执行次数,到达目标次数执行回调
 * @param {function} cb 执行完毕的回调函数
 * @param {number} total 目标执行次数
 */
function fnCallCheck(cb, total) {
	let count = 0;
	return () => {
		if (++count === total) cb && cb();
	};
}
