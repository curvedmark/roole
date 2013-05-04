'use strict';

var RooleError = require('../../error');
var Node = require('../../node');
var Evaluator = require('../');

Evaluator.prototype.visitIdentifier = function(identifierNode) {
	var childNodes = this.visit(identifierNode.children);

	var value = childNodes.map(function(childNode) {
		var value = Node.toString(childNode);
		if (value === null) {
			throw RooleError("'" + childNode.type + "' is not allowed to be interpolated in 'identifier'", childNode);
		}

		return value;
	}, this).join('');

	identifierNode.children = [value];
};