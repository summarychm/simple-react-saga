import { INCREMENT } from "./action-types";
const initialVal = { number: 0 };
function CounterReducer(state = initialVal, action) {
	switch (action.type) {
		case INCREMENT:
			return { ...state, number: state.number + (Number.isInteger(action.payload) ? action.payload : 1) };
		default:
			return state;
	}
}

export default CounterReducer;
