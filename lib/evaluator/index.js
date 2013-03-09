'use strict';

var Evaluator = require('./evaluator');
var evaluator = exports;

evaluator.evaluate = function(ast) {
	return new Evaluator().evaluate(ast);
};