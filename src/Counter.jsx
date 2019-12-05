import React from "react";
import { connect } from "react-redux";
import * as actions from "./store/actions";

function Counter(props) {
	const { number, asyncIncrement, increment, autoIncrement, stopAuto } = props;
	return (
		<>
			<p>Counter: {number}</p>
			<button onClick={increment}>increment</button>&nbsp;
			<button onClick={() => asyncIncrement(5)}>asyncIncrement+5</button>&nbsp;
			<button onClick={autoIncrement}>auto increment</button>&nbsp;
			<button onClick={stopAuto}>stopAutoIncrement</button>&nbsp;
		</>
	);
}
const mapStateToProps = (state) => state;
export default connect(mapStateToProps, actions)(Counter);
