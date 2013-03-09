'use strict';

var Extender = require('./extender');
var extender = exports;

extender.extend = function(ast) {
	return new Extender().extend(ast);
};