'use strict';

var RooleError = require('../../error');
var Node = require('../../node');

module.exports = function (evaluator, variable) {
	var name = variable.children[0];
	var val = evaluator.scope.resolve(name);
	if (!val) throw new RooleError('$' + name + ' is undefined', variable);
	val = Node.clone(val, false);
	val.loc = variable.loc;
	return val;
};