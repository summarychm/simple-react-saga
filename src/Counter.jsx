import React from "react";
import { connect } from "react-redux";
import * as actions from "./store/actions";

function Counter(props) {
	const { number, asyncIncrement, increment, stop } = props;
	return (
		<>
			<p>{number}</p>
			<button onClick={increment}>increment</button>&nbsp;
			<button onClick={() => asyncIncrement(5)}>asyncIncrement+5</button>
			<button onClick={stop}>stop</button>
		</>
	);
}
const mapStateToProps = (state) => state;
export default connect(mapStateToProps, actions)(Counter);
