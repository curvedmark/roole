'use strict'

var Normalizer = require('./normalizer')

var normalizer = exports

normalizer.normalize = function(ast, options) {
	return new Normalizer().normalize(ast, options)
}