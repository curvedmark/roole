'use strict';

var Node = require('../../node');
var Err = require('../../err');
var bif = require('../');

bif.unit = function(callNode) {
	var argumentListNode = callNode.children[1];
	var length = argumentListNode.children.length;
	if (!length) {
		throw Err('no arguments passed', callNode);
	}

	var targetNode = argumentListNode.children[0];
	var value = Node.toNumber(targetNode);
	if (value === null) {
		throw Err("'" + targetNode.type + "' is not a numberic value", targetNode);
	}

	if (length === 1) {
		switch (targetNode.type) {
		case 'number':
			return Node('string', [''], {quote: '"', loc: callNode.loc});

		case 'percentage':
			return Node('string', ['%'], {quote: '"', loc: callNode.loc});

		case 'dimension':
			var unit = targetNode.children[1];
			return Node('string', [unit], {quote: '"', loc: callNode.loc});
		}
	}

	var unitNode = argumentListNode.children[1];
	switch (unitNode.type) {
	case 'number':
		return Node('number', [value], {loc: callNode.loc});

	case 'percentage':
		return Node('percentage', [value], {loc: callNode.loc});

	case 'dimension':
		var unit = unitNode.children[1];
		return Node('dimension', [value, unit], {loc: callNode.loc});

	case 'identifier':
		var unit = unitNode.children[0];
		return Node('dimension', [value, unit], {loc: callNode.loc});

	case 'string':
		var unit = unitNode.children[0];
		if (!unit) {
			return Node('number', [value], {loc: callNode.loc});
		}
		return Node('dimension', [value, unit], {loc: callNode.loc});

	default:
		throw Err("'" + unitNode.type + "' is not a valid unit", unitNode);
	}
};