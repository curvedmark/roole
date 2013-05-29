'use strict';

var RooleError = require('../../error');
var Node = require('../../node');

module.exports = function (evaluator, call) {
	return evaluator.visit(call.children).then(function (children) {
		var func = children[0];
		var argList = children[1];

		if (typeof func === 'function') return func(call);
		if (func.type === 'identifier') return;
		if (func.type !== 'function') {
			throw new RooleError(func.type + " is not a function", func);
		}
		var scope = evaluator.scope;
		evaluator.scope = func.scope;
		evaluator.scope.push();

		var list = Node.toListNode(argList);
		evaluator.scope.define('arguments', list);

		var paramList = func.children[0];
		var params = paramList.children;
		var args = argList.children;
		params.forEach(function (param, i) {
			var ident = param.children[0];
			var name = ident.children[0];
			var val;
			if (param.type === 'restParameter') {
				val = Node.toListNode({
					type: 'argumentList',
					children: args.slice(i),
					loc: argList.loc,
				});
			} else if (i < args.length) {
				val = args[i];
			} else {
				val = param.children[1];
				if (!val) val = { type: 'null', loc: argList.loc };
			}
			evaluator.scope.define(name, val);
		});

		var context = evaluator.context;
		var ruleList = func.children[1];
		var clone = Node.clone(ruleList);
		var ret;
		if (call.mixin) {
			evaluator.context = 'mixin';
			ret = evaluator.visit(clone).then(function (ruleList) {
				return ruleList.children;
			});
		} else {
			evaluator.context = 'call';
			var returned;
			ret = evaluator.visit(clone).then(null, function (ret) {
				if (ret instanceof Error) throw ret;
				returned = ret;
			}).then(function () {
				return returned || { type: 'null', loc: call.loc };
			});
		}
		return ret.then(function (node) {
			evaluator.scope.pop();
			evaluator.scope = scope;
			evaluator.context = context;
			return node;
		});
	});
};