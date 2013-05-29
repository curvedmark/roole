'use strict';

var Node = require('../../node');
var SelectorJoiner = require('../selectorJoiner');

module.exports = function (evaluator, ruleset) {
	var parentSelList;
	return evaluator.visit(ruleset.children[0]).then(function (selList) {
		var clone = Node.clone(selList);
		selList.original = clone;
		new SelectorJoiner().join(evaluator.selectorList, selList);

		evaluator.scope.push();
		parentSelList = evaluator.selectorList;
		evaluator.selectorList = selList;
		return evaluator.visit(ruleset.children[1]);
	}).then(function () {
		evaluator.scope.pop();
		evaluator.selectorList = parentSelList;
	});
};