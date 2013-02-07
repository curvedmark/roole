'use strict'

var Err = require('../../err')
var Node = require('../../node')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitFor = function(forNode) {
	var stepNode = this.visit(forNode.children[2])
	var stepNumber = 1
	if (stepNode) {
		stepNumber = Node.toNumber(stepNode)
		if (stepNumber === null)
			throw Err("step number must be a numberic value", stepNode, this.filePath)

		if (!stepNumber)
			throw Err("step number is not allowed to be zero", stepNode, this.filePath)
	}

	var listNode = this.visit(forNode.children[3])
	if (listNode.type === 'range')
		listNode = Node.toListNode(listNode)

	var valueVariableNode = forNode.children[0]
	var valueVariableName = valueVariableNode.children[0]

	var IndexVariableNode = forNode.children[1]

	if (listNode.type === 'null') {
		this.scope.define(valueVariableName, listNode)

		if (IndexVariableNode) {
			var IndexVariableName = IndexVariableNode.children[0]
			var IndexNode = Node('null', {loc: IndexVariableNode.loc})
			this.scope.define(IndexVariableName, IndexNode)
		}

		return null
	}

	var ruleListNode = forNode.children[4]

	if (listNode.type !== 'list') {
		this.scope.define(valueVariableName, listNode)

		if (IndexVariableNode) {
			var IndexVariableName = IndexVariableNode.children[0]
			var IndexNode = Node('number', [0], {loc: IndexVariableNode.loc})
			this.scope.define(IndexVariableName, IndexNode)
		}

		return this.visit(ruleListNode.children)
	}

	var itemNodes = listNode.children
	var ruleNodes = []
	var length = itemNodes.length

	if (stepNumber > 0)
		for (var i = 0, j = i, length = itemNodes.length; i < length; i += 2 * stepNumber, ++j) {
			iterate.call(this, itemNodes[i], j, i === length - 1)
		}
	else
		for (var i = itemNodes.length - 1, j = Math.floor(i / 2); i >= 0; i += 2 * stepNumber, --j) {
			iterate.call(this, itemNodes[i], j, !i)
		}

	function iterate(itemNode, i, isLast) {
		this.scope.define(valueVariableName, itemNode)

		if (IndexVariableNode) {
			var IndexVariableName = IndexVariableNode.children[0]
			var IndexNode = Node('number', [i], {loc: IndexVariableNode.loc})
			this.scope.define(IndexVariableName, IndexNode)
		}

		var ruleListClone = isLast ? ruleListNode : Node.clone(ruleListNode)
		this.visit(ruleListClone)
		ruleNodes = ruleNodes.concat(ruleListClone.children)
	}

	return ruleNodes
}