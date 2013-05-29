'use strict';

var RooleError = require('../../error');
var Node = require('../../node');

module.exports = function (evaulator, range) {
	return evaulator.visit(range.children).then(function (children) {
		var from = children[0];
		var to = children[1];

		var invalid;
		if (Node.toNumber(from) === undefined) invalid = from;
		else if (Node.toNumber(to) === undefined) invalid = to;

		if (invalid) throw new RooleError(invalid.type + ' is not a numberic value', invalid);
	});
};