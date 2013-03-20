'use strict';

var Err =require('../../err');
var Node = require('../../node');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitMember = function(memberNode) {
	this.visit(memberNode.children);

	var targetNode = memberNode.children[0];
	if (targetNode.type === 'null') {
		throw new Err("can not read items in 'null'", targetNode, this.filePath)
	}

	var itemNodes;
	if (targetNode.type === 'list') {
		itemNodes = targetNode.children;
	} else {
		itemNodes = [targetNode];
	}

	var lastIndex = (itemNodes.length - 1) / 2;
	// toNumber is inclusive, not smaller than fromNumber
	var fromNumber, toNumber;
	var reversed = false;

	var accessorNode = memberNode.children[1];
	if (accessorNode.type === 'range') {
		var fromNode = accessorNode.children[0];
		fromNumber = fromNode.children[0];
		if (fromNumber < 0) { fromNumber += lastIndex + 1; }

		var operator = accessorNode.children[1];
		var exclusive = operator === '...';

		var toNode = accessorNode.children[2];
		toNumber = toNode.children[0];
		if (toNumber < 0) { toNumber += lastIndex + 1; }

		if (exclusive) {
			if (fromNumber === toNumber) {
				return new Node('null', {loc: memberNode.loc});
			}

			toNumber += fromNumber <= toNumber ? -1 : 1;
		}

		if (toNumber < fromNumber) {
			var tmpNumber = fromNumber;
			fromNumber = toNumber;
			toNumber = tmpNumber;
			reversed = true;
		}
	} else {
		fromNumber = Node.toNumber(accessorNode);
		if (fromNumber === null) {
			throw new Err("'" + accessorNode.type + "' can not be used to access items in a list", accessorNode, this.filePath);
		}
		if (fromNumber < 0) { fromNumber += lastIndex + 1; }

		toNumber = fromNumber;
	}

	if (toNumber < 0 || fromNumber > lastIndex) {
		return new Node('null', {loc: memberNode.loc});
	}

	fromNumber = Math.max(fromNumber, 0);
	toNumber = Math.min(toNumber, lastIndex);

	if (fromNumber === toNumber) {
		return itemNodes[fromNumber * 2];
	}

	var nodes = itemNodes.slice(fromNumber * 2, toNumber * 2 + 1);
	if (reversed) nodes.reverse();

	return new Node('list', nodes, {loc: memberNode.loc});
};