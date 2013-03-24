'use strict';

var Err = require('../../err');
var Node = require('../../node');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitIdentifier = function(identifierNode) {
	var childNodes = this.visit(identifierNode.children);

	var value = childNodes.map(function(childNode) {
		var value = Node.toString(childNode);
		if (value === null) {
			throw Err("'" + childNode.type + "' is not allowed to be interpolated in 'identifier'", childNode, this.fileName);
		}

		return value;
	}, this).join('');

	identifierNode.children = [value];
};