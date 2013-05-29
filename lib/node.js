/**
 * Node
 *
 * A collection of node utility functions.
 */
'use strict';

var RooleError = require('./error');

var Node = exports;

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

	if ((deep === undefined || deep) && node.children) {
		clone.children = Node.clone(node.children);
	}

	return clone;
};

Node.replace = function(newNode, oldNode) {
	for (var key in newNode) {
		oldNode[key] = newNode[key];
	}

	return oldNode;
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

	switch (node1.type) {
	case 'range':
	case 'attributeSelector':
		if (node1.operator !== node2.operator) return false;
		break;
	}

	return Node.equal(node1.children, node2.children);
};

Node.toNumber = function(node) {
	switch (node.type) {
	case 'number':
	case 'percentage':
	case 'dimension':
		return +node.children[0].toFixed(3);
	}
};

Node.toString = function(node) {
	if (typeof node === 'string') return node;

	switch (node.type) {
	case 'number':
		return '' + node.children[0];
	case 'identifier':
	case 'string':
		return '' + node.children[0];
	case 'percentage':
		return Node.toNumber(node) + '%';
	case 'dimension':
		return Node.toNumber(node) + node.children[1];
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
		return !!node.children[0];
	}
	return true;
};

Node.toValue = function (node) {
	switch (node.type) {
	case 'number':
	case 'percentage':
	case 'dimension':
		return Node.toNumber(node);
	case 'boolean':
	case 'identifier':
	case 'string':
		return node.children[0];
	}
};

Node.toArray = function (node) {
	switch (node.type) {
	case 'list':
		return node.children.filter(function (item, i) {
			if (i % 2 === 0) return true;
		});
	case 'range':
		var ex = node.operator === '...';
		var from = node.children[0];
		var fromNum = from.children[0];
		var to = node.children[1];
		var toNum = to.children[0];

		if (!ex) {
			if (fromNum <= toNum) ++toNum;
			else --toNum;
		}
		var items = [];
		if (fromNum <= toNum) {
			for (var i = fromNum; i < toNum; ++i) {
				createNum(i);
			}
		} else {
			for (var i = fromNum; i > toNum; --i) {
				createNum(i);
			}
		}
		return items;
	}
	return [node];

	function createNum(i) {
		var clone = Node.clone(from);
		clone.children[0] = i;
		items.push(clone);
	}
};

Node.toListNode = function(node) {
	switch (node.type) {
	case 'range':
		var operator = node.operator;
		var exclusive = operator === '...';

		var fromNode = node.children[0];
		var fromNumber = fromNode.children[0];

		var toNode = node.children[1];
		var toNumber = toNode.children[0];

		var stepNumber = fromNumber <= toNumber ? 1 : -1;

		if (exclusive) {
			if (fromNumber === toNumber) {
				return {
					type: 'null',
					loc: node.loc,
				};
			}

			toNumber -= stepNumber;
		}

		var fromNode = node.children[0];
		var itemNodes = [];
		var separatorNode;

		for (
			var i = fromNumber;
			stepNumber > 0 ? i <= toNumber : i >= toNumber;
			i += stepNumber
		) {
			if (i !== fromNumber) {
				if (!separatorNode)
					separatorNode = {
						type: 'separator',
						children: [' '],
						loc: node.loc,
					};
				itemNodes.push(separatorNode);
			}

			var fromClone = Node.clone(fromNode);
			fromClone.children[0] = i;
			itemNodes.push(fromClone);
		}

		if (itemNodes.length === 1) {
			return itemNodes[0];
		}

		return {
			type: 'list',
			children: itemNodes,
			loc: node.loc,
		};

	case 'argumentList':
		if (!node.children.length) {
			return {
				type: 'null',
				loc: node.loc,
			};
		}

		var listNode = {
			type: 'list',
			children: [node.children[0]],
			loc: node.loc,
		};
		for (var i = 1, length = node.children.length; i < length; ++i) {
			var separatorNode = {
				type: 'separator',
				children: [','],
				loc: node.loc,
			};
			listNode.children.push(separatorNode, node.children[i]);
		}

		return listNode;
	}

	return node;
};

Node.perform = function (op, left, right) {
	switch (left.type + ' ' + op + ' ' + right.type) {
	case 'number + number':
	case 'percentage + number':
	case 'percentage + percentage':
	case 'dimension + number':
	case 'dimension + dimension':
	case 'identifier + number':
	case 'identifier + boolean':
	case 'identifier + identifier':
	case 'string + number':
	case 'string + boolean':
	case 'string + identifier':
	case 'string + string':
		var clone = Node.clone(left);
		clone.children[0] += right.children[0];
		return clone;
	case 'identifier + percentage':
	case 'identifier + dimension':
	case 'string + dimension':
	case 'string + percentage':
		var clone = Node.clone(left);
		clone.children[0] += Node.toString(right);
		return clone;
	case 'number + percentage':
	case 'number + dimension':
	case 'number + string':
	case 'boolean + identifier':
	case 'boolean + string':
	case 'identifier + string':
		var clone = Node.clone(right);
		clone.children[0] = left.children[0] + clone.children[0];
		return clone;
	case 'percentage + string':
	case 'dimension + string':
		var clone = Node.clone(right);
		clone.children[0] = Node.toString(left) + clone.children[0];
		return clone;
	case 'number - number':
	case 'percentage - percentage':
	case 'percentage - number':
	case 'dimension - dimension':
	case 'dimension - number':
		var clone = Node.clone(left);
		clone.children[0] -= right.children[0];
		return clone;
	case 'number - dimension':
	case 'number - percentage':
		var clone = Node.clone(right);
		clone.children[0] = left.children[0] - right.children[0];
		return clone;
	case 'number * number':
	case 'percentage * number':
	case 'dimension * number':
		var clone = Node.clone(left);
		clone.children[0] *= right.children[0];
		return clone;
	case 'number * dimension':
	case 'number * percentage':
		var clone = Node.clone(right);
		clone.children[0] = left.children[0] * right.children[0];
		return clone;
	case 'number / number':
	case 'percentage / number':
	case 'dimension / number':
		var divisor = right.children[0];
		if (divisor === 0) throw new RooleError('divide by zero', right);
		var clone = Node.clone(left);
		clone.children[0] /= divisor;
		return clone;
	case 'percentage / percentage':
	case 'dimension / dimension':
		var divisor = right.children[0];
		if (divisor === 0) throw new RooleError('divide by zero', right);
		return {
			type: 'number',
			children: [left.children[0] / divisor],
			loc: left.loc,
		};
	case 'number / dimension':
	case 'number / percentage':
		var divisor = right.children[0];
		if (divisor === 0) throw new RooleError('divide by zero', right);
		var clone = Node.clone(right);
		clone.children[0] = left.children[0] / divisor;
		return clone;
	case 'number % number':
	case 'percentage % number':
	case 'dimension % number':
		var divisor = right.children[0];
		if (divisor === 0) throw new RooleError('modulo by zero', right);
		var clone = Node.clone(left);
		clone.children[0] %= right.children[0];
		return clone;
	case 'number % percentage':
	case 'number % dimension':
		var divisor = right.children[0];
		if (divisor === 0) throw new RooleError('modulo by zero', right);
		var clone = Node.clone(right);
		clone.children[0] = left.children[0] % right.children[0];
		return clone;
	case 'percentage % percentage':
	case 'dimension % dimension':
		var divisor = right.children[0];
		if (divisor === 0) throw new RooleError('modulo by zero', right);
		return {
			type: 'number',
			children: [left.children[0] % divisor],
			loc: left.loc,
		};
	}
	throw new RooleError('unsupported binary operation: ' + left.type + ' ' + op + ' ' + right.type, left);
};