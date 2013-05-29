'use strict';

var _ = require('../../helper');
var Parser = require('../../parser');

module.exports = function (evaluator, interp) {
	return evaluator.visit(interp.children).then(function (children) {
		var str = children[0];
		if (str.type !== 'string') {
			interp.type = 'mediaType';
			return;
		}
		var val = str.children[0].trim();
		var opts = _.mixin({}, evaluator.options, {
			startRule: 'mediaQuery',
			loc: str.loc,
		});
		var mq = new Parser(opts).parse(val);
		return evaluator.visit(mq).then(function (mq) {
			return mq.children;
		});
	});
};