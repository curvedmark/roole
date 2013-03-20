'use strict';

var Err = require('../../err')
var Node = require('../../node')
var Evaluator = require('../evaluator');

Evaluator.prototype.visitAssignment = function(assignmentNode) {
	var leftNode = assignmentNode.children[0];
	var operator = assignmentNode.children[1];
	var valueNode = this.visit(assignmentNode.children[2]);

	var variableName
	if (leftNode.type === 'variable') {
		variableName = leftNode.children[0];
		if (operator === '?=' && this.scope.resolve(variableName)) {
			return null;
		}

		this.scope.define(variableName, valueNode);
		return null;
	}
	var variableNode = leftNode.children[0];
	variableName = variableNode.children[0];

	var targetNode = this.visit(variableNode);

	if (targetNode.type === 'null') {
		throw new Err("can not assign to items in 'null'", targetNode, this.filePath)
	}

	var itemNodes = targetNode.type === 'list' ? targetNode.children : [targetNode];
	var lastIndex = (itemNodes.length - 1) / 2;
	var fromNumber, toNumber;
	var reversed = false;

	var accessorNode = this.visit(leftNode.children[1]);
	if (accessorNode.type === 'range') {
		var fromNode = accessorNode.children[0];
		fromNumber = fromNode.children[0];
		if (fromNumber < 0) { fromNumber += lastIndex + 1; }

		var operator = accessorNode.children[1];
		var exclusive = operator === '...';

		var toNode = accessorNode.children[2];
		toNumber = toNode.children[0];
		if (toNumber < 0) { toNumber += lastIndex + 1; }

		if (!exclusive) {
			toNumber += fromNumber <= toNumber ? 1 : -1;
		}

		if (toNumber < fromNumber) {
			var tmpNumber = fromNumber;
			fromNumber = toNumber + 1;
			toNumber = tmpNumber + 1;
			reversed = true;
		}
	} else {
		fromNumber = Node.toNumber(accessorNode);
		if (fromNumber === null) {
			throw new Err("'" + accessorNode.type + "' can not be used to access items in a list", accessorNode, this.filePath);
		}
		if (fromNumber < 0) { fromNumber += lastIndex + 1; }

		toNumber = fromNumber + 1;
	}

	var valueNodes;
	if (accessorNode.type === 'range' && valueNode.type === 'list') {
		valueNodes = valueNode.children.slice(0);
		if (reversed) { valueNodes.reverse(); }
	} else {
		valueNodes = [valueNode];
	}

	if (toNumber <= 0) {
		var separatorNode;
		if (itemNodes.length > 1) {
			separatorNode = itemNodes[itemNodes.length - 2];
		} else if (valueNodes.length > 1) {
			separatorNode = valueNodes[valueNodes.length - 2];
		} else {
			separatorNode = new Node('separator', [' '], {loc: valueNode.loc});
		}

		var offset = -toNumber;
		if (offset) {
			var nullNode = new Node('null', {loc: valueNode.loc});
			for (var i = 0; i < offset; ++i) {
				valueNodes.push(separatorNode, nullNode);
			}
		}
		valueNodes.push(separatorNode);

		itemNodes = valueNodes.concat(itemNodes);
	} else if (fromNumber >= lastIndex + 1) {
		var separatorNode;
		if (itemNodes.length > 1) {
			separatorNode = itemNodes[1];
		} else if (valueNodes.length > 1) {
			separatorNode = valueNodes[1];
		} else {
			separatorNode = new Node('separator', [' '], {loc: valueNode.loc});
		}

		itemNodes.push(separatorNode);
		var offset = fromNumber - lastIndex - 1;
		if (offset) {
			var nullNode = new Node('null', {loc: valueNode.loc});
			for (var i = 0; i < offset; ++i) {
				itemNodes.push(nullNode, separatorNode);
			}
		}

		itemNodes = itemNodes.concat(valueNodes);
	} else {
		fromNumber = Math.max(fromNumber, 0);
		toNumber = Math.min(toNumber, lastIndex + 1);

		var args;
		if (fromNumber === toNumber) {
			var separatorNode = itemNodes[fromNumber * 2 - 1];
			args = [fromNumber * 2, 0].concat(valueNodes, separatorNode);
		} else {
			args = [fromNumber * 2, toNumber * 2 - fromNumber * 2 - 1].concat(valueNodes);
		}

		itemNodes.splice.apply(itemNodes, args);
	}

	var node = itemNodes.length === 1 ?
		itemNodes[0]:
		new Node('list', itemNodes, {loc: valueNode.loc});

	this.scope.define(variableName, node);

	return null;
};