'use strict';

var Err = require('../../err');
var Node = require('../../node');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitString = function(stringNode) {
	if (stringNode.quote === "'") {
		return;
	}

	var childNodes = this.visit(stringNode.children);
	var value = childNodes.map(function(childNode) {
		var value = Node.toString(childNode);
		if (value === null) {
			throw Err("'" + childNode.type + "' is not allowed to be interpolated in 'string'", childNode, this.filename);
		}

		if (childNode.type === 'string') {
			value = value.replace(/\\?"/g, function(quote) {
				return quote.length === 1 ? '\\"' : quote;
			});
		}

		return value;
	}, this).join('');
	stringNode.children = [value];
};