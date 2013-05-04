'use strict';

var RooleError = require('../../error');
var Evaluator = require('../');

Evaluator.prototype.visitClassSelector = function(classSelectorNode) {
	this.visit(classSelectorNode.children);

	var valueNode = classSelectorNode.children[0];
	if (valueNode.type !== 'identifier') {
		throw RooleError("'" + valueNode.type + "' can not be used in class selector", valueNode);
	}
	var value = valueNode.children[0];

	if (this.parentModuleName) {
		valueNode.children[0] = this.parentModuleName + value;
	}
};