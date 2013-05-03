'use strict';

var Compiler = require('./');

Compiler.prototype.visitNull = function() {
	return 'null';
};