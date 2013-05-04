'use strict';

var RooleError = require('../../error');
var Node = require('../../node');
var Evaluator = require('../');

Evaluator.prototype.visitVariable = function(variableNode) {
	var variableName = variableNode.children[0];
	var valueNode = this.scope.resolve(variableName);

	if (!valueNode) {
		throw RooleError('$' + variableName + ' is undefined', variableNode);
	}

	valueNode = Node.clone(valueNode, false);
	valueNode.loc = variableNode.loc;

	return valueNode;
};