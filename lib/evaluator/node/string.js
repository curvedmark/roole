'use strict';

var RooleError = require('../../error');
var Node = require('../../node');

module.exports = function (evaluator, str) {
	if (str.quote === "'") return;
	return evaluator.visit(str.children).then(function (children) {
		var val = children.map(function (child) {
			var val = Node.toString(child);
			if (val === undefined) throw new RooleError(child.type + " is not allowed to be interpolated in String", child);
			// escape lone double quotes
			if (child.type === 'string') {
				val = val.replace(/\\?"/g, function(quote) {
					return quote.length === 1 ? '\\"' : quote;
				});
			}
			return val;
		}).join('');
		str.children = [val];
	});
};