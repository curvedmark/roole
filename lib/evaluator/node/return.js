'use strict';

var RooleError = require('../../error');

module.exports = function (evaluator, ret) {
	if (!evaluator.context) throw new RooleError('@return is only allowed inside @function', ret);
	if (evaluator.context === 'call') throw evaluator.visit(ret.children[0]);
	return null;
};