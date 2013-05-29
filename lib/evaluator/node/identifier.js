'use strict';

var RooleError = require('../../error');
var Node = require('../../node');

module.exports = function (evaluator, ident) {
	return evaluator.visit(ident.children).then(function (children) {
		var val = children.map(function (child) {
			var val = Node.toString(child);
			if (val === undefined) throw new RooleError(child.type + " is not allowed to be interpolated in Identifier", child);
			return val;
		}).join('');
		ident.children = [val];
	});
};