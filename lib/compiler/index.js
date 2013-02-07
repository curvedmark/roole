'use strict'

var Compiler = require('./compiler')

var compiler = exports

compiler.compile = function(ast, options) {
	return new Compiler().compile(ast, options)
}