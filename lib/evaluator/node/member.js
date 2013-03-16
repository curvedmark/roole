'use strict';

var Node = require('../../node');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitMember = function(memberNode) {
	var valueNode = this.visit(memberNode.children[0]);
	var accessorNode = this.visit(memberNode.children[1]);

	if (accessorNode.type === 'range') {
		var fromNode = accessorNode.children[0];
		var fromNumber = fromNode.children[0];

		var operator = accessorNode.children[1];
		var exclusive = operator === '...';

		var toNode = accessorNode.children[2];
		var toNumber = toNode.children[0];

		if (valueNode.type !== 'list') {
			if (fromNumber < 0) { ++fromNumber; }
			if (toNumber < 0) { ++toNumber; }

			if (exclusive) {
				if (fromNumber === toNumber) {
					return new Node('null', {loc: memberNode.loc});
				}

				if (fromNumber < toNumber) {
					--toNumber;
				} else {
					++toNumber;
				}
			}

			if (
				fromNumber < 0 && toNumber < 0 ||
				fromNumber > 0 && toNumber > 0
			) {
				return new Node('null', {loc: memberNode.loc});
			}

			return valueNode;
		}

		var itemNodes = valueNode.children;
		var lastIndex = (itemNodes.length - 1) / 2;

		if (fromNumber < 0) { fromNumber = lastIndex + 1 + fromNumber; }
		if (toNumber < 0) { toNumber = lastIndex + 1 + toNumber; }

		if (exclusive) {
			if (fromNumber === toNumber) {
				return new Node('null', {loc: memberNode.loc});
			}

			if (fromNumber < toNumber) {
				--toNumber;
			} else {
				++toNumber;
			}
		}

		var smallNumber = Math.min(fromNumber, toNumber);
		var largeNumber = Math.max(fromNumber, toNumber);
		if (largeNumber < 0 || smallNumber > lastIndex) {
			return new Node('null', {loc: memberNode.loc});
		}

		fromNumber = Math.min(Math.max(fromNumber, 0), lastIndex);
		toNumber = Math.min(Math.max(toNumber, 0), lastIndex);

		if (fromNumber === toNumber) {
			return itemNodes[fromNumber * 2];
		}

		var nodes = fromNumber < toNumber ?
			itemNodes.slice(fromNumber * 2, toNumber * 2 + 1):
			itemNodes.slice(toNumber * 2, fromNumber * 2 + 1).reverse();

		if (nodes.length === 1) {
			return nodes[0];
		}

		return new Node('list', nodes, {loc: memberNode.loc});
	}

	var index = Node.toNumber(accessorNode);
	if (index === null) {
		return new Node('null', {loc: memberNode.loc});
	}

	if (valueNode.type !== 'list') {
		if (index < 0) { ++index; }

		if (index !== 0) {
			return new Node('null', {loc: memberNode.loc});
		}

		return valueNode;
	}

	var lastIndex = (valueNode.children.length - 1) / 2;
	if (index < 0) { index = lastIndex + 1 + index; }

	if (index < 0 || index > lastIndex) {
		return new Node('null', {loc: memberNode.loc});
	}

	return valueNode.children[index * 2];
};