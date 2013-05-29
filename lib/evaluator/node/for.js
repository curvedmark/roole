'use strict';

var P = require('p-promise');
var RooleError = require('../../error');
var Node = require('../../node');

module.exports = function (evaluator, forNode) {
	var stepNum;
	return evaluator.visit(forNode.children[2]).then(function (step) {
		stepNum = 1;
		if (step) {
			stepNum = Node.toNumber(step);
			if (stepNum === undefined) throw new RooleError("step must be a numberic value", step);
			if (stepNum === 0) throw new RooleError("step is not allowed to be zero", step);
		}
		return evaluator.visit(forNode.children[3]);
	}).then(function (list) {
		var valVar = forNode.children[0];
		var idxVar = forNode.children[1];
		var valVarName = valVar.children[0];
		var idxVarName;
		if (idxVar) idxVarName = idxVar.children[0];
		var items = Node.toArray(list);

		if (!items.length) {
			if (!evaluator.scope.resolve(valVarName)) {
				evaluator.scope.define(valVarName, {
					type: 'null',
					loc: valVar.loc,
				});
			}
			if (idxVar && !evaluator.scope.resolve(idxVarName)) {
				evaluator.scope.define(idxVarName, {
					type: 'null',
					loc: idxVar.loc,
				});
			}
			return null;
		}

		var ruleList = forNode.children[4];
		var rules = [];
		var promise = P();
		if (stepNum > 0) {
			for (var i = 0, last = items.length - 1; i <= last; i += stepNum) {
				visitRuleList(items[i], i, i === last);
			}
		} else {
			for (var i = items.length - 1; i >= 0; i += stepNum) {
				visitRuleList(items[i], i, i === 0);
			}
		}
		return promise.then(function () {
			return rules;
		});

		function visitRuleList(item, i, isLast) {
			promise = promise.then(function () {
				evaluator.scope.define(valVarName, item);
				if (idxVar) {
					evaluator.scope.define(idxVarName, {
						type: 'number',
						children: [i],
						loc: idxVar.loc,
					});
				}
				var clone = isLast ? ruleList : Node.clone(ruleList);
				return evaluator.visit(clone);
			}).then(function (clone) {
				rules = rules.concat(clone.children);
			});
		}
	});
};