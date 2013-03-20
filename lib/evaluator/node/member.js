'use strict';

var Err =require('../../err');
var Node = require('../../node');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitMember = function(memberNode) {
	var targetNode = this.visit(memberNode.children[0]);
	if (targetNode.type === 'null') {
		throw new Err("can not read items in 'null'", targetNode, this.filePath);
	}

	var itemNodes;
	if (targetNode.type === 'list') {
		itemNodes = targetNode.children;
	} else {
		itemNodes = [targetNode];
	}

	var lastIndex = (itemNodes.length - 1) / 2;
	var accessorNode = this.visit(memberNode.children[1]);
	var range = Node.toRange(accessorNode, lastIndex + 1);
	if (range === null) {
		throw new Err("'" + accessorNode.type + "' can not be used to access items in a list", accessorNode, this.filePath);
	}

	if (range.to === range.from || range.to <= 0 || range.from > lastIndex) {
		return new Node('null', {loc: memberNode.loc});
	}

	range.from = Math.max(range.from, 0);
	range.to = Math.min(range.to, lastIndex + 1);

	var itemNodes = itemNodes.slice(range.from * 2, range.to * 2 - 1);
	if (itemNodes.length === 1) {
		return itemNodes[0];
	}

	if (range.reversed) { itemNodes.reverse(); }

	return new Node('list', itemNodes, {loc: memberNode.loc});
};