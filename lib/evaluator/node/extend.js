'use strict';

var MediaFilter = require('../mediaFilter');
var RulesetFilter = require('../rulesetFilter');
var RulesetExtender = require('../rulesetExtender');

module.exports = function(evaluator, extend) {
	return evaluator.visit(extend.children).then(function (children) {
		var nodes = evaluator.boundary.children;

		var options = { stop: extend };
		if (evaluator.mediaQueryList) {
			options.mediaQueryList = evaluator.mediaQueryList;
			var medias = new MediaFilter(options).filter(nodes);
			nodes = [];
			medias.forEach(function(media) { nodes = nodes.concat(media.children); });
		}
		var rulesets = [];
		var selList = children[0];
		selList.children.forEach(function(sel) {
			options.selector = sel;
			var filtered = new RulesetFilter(options).filter(nodes, sel);
			rulesets = rulesets.concat(filtered);
		});
		options.selectorList = evaluator.selectorList;
		options.recordExtend = !evaluator.void;
		new RulesetExtender(options).extend(rulesets);
		return null;
	});
};