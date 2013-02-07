'use strict'

var Evaluator = require('./evaluator')

var evaluator = exports

evaluator.evaluate = function(ast, options) {
	return new Evaluator().evaluate(ast, options)
}