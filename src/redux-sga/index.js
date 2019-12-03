const EventEmitter = require("events");

/** createSagaMiddleware本质是个中间件,其上挂载了run方法,
 * 用于加载sagaGenerator
 */
export default function createSagaMiddleware() {
	const events = new EventEmitter();
	let sagaMiddleware = ({ getState, dispatch }) => {
		// 注入sagaGenerator处理流程
		sagaMiddleware.run = function run(generator) {
			const it = generator(); // 执行generator
			// 用于递归执行generator
			function next(val) {
				const { value: effect, done } = it.next(val);
				if (done) return;
				switch (effect.type) {
					case "TAKE":
						// 将effect.actionType作为key,当前的next函数为回调,注册到events
						events.once(effect.actionType, next);
						break;
					case "PUT":
						dispatch(effect.action); // 派发action
						break;
					// case "CALL":
					// 	const { fn, args, context } = effect.payload;
					// 	fn.apply(context, args).then;
					// 	break;
					default:
						break;
				}
			}
			next();
		};

		return (next) => (action) => {
			events.emit(action.type, action); // 监听任何action,并将action.type作为key来emit.
			return next(action); // 因无法准备知道当前action是专门用于saga的,所以调用next继续交由后续中间件处理
		};
	};

	return sagaMiddleware;
}
