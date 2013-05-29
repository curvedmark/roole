'use strict';

var RooleError = require('../../error');

module.exports = function (evaluator, sel) {
	return evaluator.visit(sel.children).then(function (children) {
		var ident = children[0];
		if (ident.type !== 'identifier') {
			throw new RooleError(ident.type + " is not allowed in class selector", ident);
		}
		if (!evaluator.module) return;
		ident.children[0] = evaluator.module + ident.children[0];
	});
};