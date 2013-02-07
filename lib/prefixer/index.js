'use strict'

var Prefixer = require('./prefixer')

var prefixer = exports

prefixer.prefix = function(ast, options) {
	return new Prefixer().prefix(ast, options)
}