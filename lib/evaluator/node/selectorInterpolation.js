'use strict';

var _ = require('../../helper');
var Parser = require('../../parser');

module.exports = function (evaluator, interp) {
	return evaluator.visit(interp.children).then(function (children) {
		var str = children[0];
		if (str.type !== 'string') {
			str.type = 'typeSelector';
			return;
		}
		var val = str.children[0].trim();
		var opts = _.mixin({}, evaluator.options, {
			startRule: 'selector',
			loc: str.loc,
		});
		var sel = new Parser(opts).parse(val);
		return sel.children;
	});
};