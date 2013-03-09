'use strict';

var Normalizer = require('./normalizer');
var normalizer = exports;

normalizer.normalize = function(ast) {
	return new Normalizer().normalize(ast);
};