'use strict';

var Compiler = require('../');

Compiler.prototype.visitColor = function(color) {
	return '#' + color.children[0];
};