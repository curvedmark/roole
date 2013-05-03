'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitMediaFeature = function(mf) {
	var name = this.visit(mf.children[0]);
	var value = this.visit(mf.children[1]) || '';
	if (value) value = ': ' + value;
	return '(' + name + value + ')';
};