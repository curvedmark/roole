/**
 * Node
 *
 * A collection of node utility functions.
 */
'use strict';

var _ = require('./helper');

var Node = module.exports = function(type, children, properties) {
	if (!Array.isArray(children)) {
		properties = children;
		children = null;
	}

	var node = this;

	if (properties) { _.extend(node, properties); }
	if (children) { node.children = children; }
	node.type = type;

	return node;
};

Node.clone = function(node, deep) {
	if (Array.isArray(node)) {
		return node.map(function(node) {
			return Node.clone(node);
		});
	}

	if (node === null || typeof node !== 'object') {
		return node;
	}

	var clone = Object.create(node);

	if ((deep == null || deep) && node.children) {
		clone.children = Node.clone(node.children);
	}

	return clone;
};

Node.equal = function(node1, node2) {
	if (Array.isArray(node1) || Array.isArray(node2)) {
		if (!Array.isArray(node1) || !Array.isArray(node2)) {
			return false;
		}

		if (node1.length !== node2.length) {
			return false;
		}

		return node1.every(function(childNode1, i) {
			var childNode2 = node2[i];
			return Node.equal(childNode1, childNode2);
		});
	}

	if (node1 === null ||
	    typeof node1 !== 'object' ||
	    node2 === null ||
	    typeof node2 !== 'object'
	) {
		return node1 === node2;
	}

	if (node1.type !== node2.type) {
		return false;
	}

	if (!node1.children && !node2.children) {
		return true;
	}

	if (!node1.children || !node2.children) {
		return false;
	}

	return Node.equal(node1.children, node2.children);
};

Node.toNumber = function(node) {
	switch (node.type) {
	case 'number':
	case 'percentage':
	case 'dimension':
		return node.children[0];
	default:
		return null;
	}
};

Node.toBoolean = function(node) {
	switch (node.type) {
	case 'boolean':
		return node.children[0];
	case 'number':
	case 'percentage':
	case 'dimension':
		return !!node.children[0];
	case 'identifier':
	case 'string':
		return node.children.length !== 1 || !!node.children[0];
	}

	return true;
};

Node.toRange = function(node, length) {
	if (node.type === 'range') {
		var fromNode = node.children[0];
		var fromNumber = fromNode.children[0];

		var operator = node.children[1];
		var exclusive = operator === '...';

		var toNode = node.children[2];
		var toNumber = toNode.children[0];

		if (typeof length === 'number') {
			if (fromNumber < 0) { fromNumber += length; }
			if (toNumber < 0) { toNumber += length; }
		}

		var reversed = false;
		if (toNumber < fromNumber) {
			var tmpNumber = fromNumber;

			fromNumber = toNumber;
			if (exclusive) { ++fromNumber; }

			toNumber = tmpNumber;
			++toNumber;

			reversed = true;
		} else {
			if (!exclusive) { ++toNumber; }
		}

		return {
			from: fromNumber,
			to: toNumber,
			reversed: reversed
		};
	}

	var fromNumber = Node.toNumber(node);
	if (typeof length === 'number' && fromNumber < 0) {
		fromNumber += length;
	}

	return fromNumber === null ? null : {
		from: fromNumber,
		to: fromNumber + 1,
		reversed: false
	};
};

Node.toListNode = function(node) {
	switch (node.type) {
	case 'range':
		var range = Node.toRange(node);
		if (range === null || range.from === range.to) {
			return new Node('null', {loc: node.loc});
		}

		var fromNode = node.children[0];
		var separatorNode = new Node('separator', [' '], {loc: node.loc});
		var itemNodes = [];
		for (var i = range.from, length = range.to; i < length; ++i) {
			if (i !== range.from) {
				itemNodes.push(separatorNode);
			}

			var fromClone = Node.clone(fromNode);
			fromClone.children[0] = i;
			itemNodes.push(fromClone);
		}

		if (itemNodes.length === 1) {
			return itemNodes[0];
		}

		if (range.reversed) { itemNodes.reverse(); }

		return new Node('list', itemNodes, {loc: node.loc});

	case 'argumentList':
		if (!node.children.length) {
			return new Node('null', {loc: node.loc});
		}

		var listNode = new Node('list', [node.children[0]], {loc: node.loc});
		for (var i = 1, length = node.children.length; i < length; ++i) {
			var separatorNode = new Node('separator', [','], {loc: node.loc});
			listNode.children.push(separatorNode, node.children[i]);
		}

		return listNode;
	}
};