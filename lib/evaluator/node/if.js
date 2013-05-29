'use strict';

var Node = require('../../node');

module.exports = function (evaluator, ifNode) {
	return evaluator.visit(ifNode.children[0]).then(function (cond) {
		if (Node.toBoolean(cond)) {
			return evaluator.visit(ifNode.children[1]).then(function (ruleList) {
				return ruleList.children;
			});
		}
		var alter = ifNode.children[2];
		if (!alter) return null;
		return evaluator.visit(alter).then(function (ruleList) {
			if (alter.type === 'if') return ruleList;
			return ruleList.children;
		});
	});
};