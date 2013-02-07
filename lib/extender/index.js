'use strict'

var Extender = require('./extender')

var extender = exports

extender.extend = function(ast, options) {
	return new Extender().extend(ast, options)
}