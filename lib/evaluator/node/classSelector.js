'use strict';

var Err = require('../../err');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitClassSelector = function(classSelectorNode) {
	this.visit(classSelectorNode.children);

	var valueNode = classSelectorNode.children[0];
	if (valueNode.type !== 'identifier') {
		throw Err("'" + valueNode.type + "' can not be used in class selector", valueNode, this.fileName);
	}
	var value = valueNode.children[0];

	if (this.parentModuleName) {
		valueNode.children[0] = this.parentModuleName + value;
	}
};