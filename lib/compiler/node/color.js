'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitColor = function(color) {
	return '#' + color.children[0];
};