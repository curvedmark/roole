'use strict';

var P = require('p-promise');

module.exports = function (evaluator, func) {
	func.scope = evaluator.scope.clone();
	var paramList = func.children[0];
	var params = paramList.children;

	return params.reduce(function (promise, param) {
		return promise.then(function () {
			return evaluator.visit(param.children[1]);
		}).then(function (defaultVal) {
			if (!defaultVal) return;
			param.children[1] = defaultVal;
		});
	}, P());
};