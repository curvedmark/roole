'use strict'

var Err = require('../../err')
var Node = require('../../node')

var Evaluator = require('../evaluator')

Evaluator.prototype.visitMixinCall = function(mixinCallNode) {
	var mixinNode = this.visit(mixinCallNode.children[0])

	if (mixinNode.type !== 'mixin')
		throw Err("'" + mixinNode.type + "' is not a 'mixin'", mixinCallNode, this.filePath)

	this.scope.add()

	var argumentListNode = this.visit(mixinCallNode.children[1])
	var argumentNodes = argumentListNode ? argumentListNode.children : []

	var parameterListNode = mixinNode.children[0]
	var parameterNodes = parameterListNode ? parameterListNode.children : []

	parameterNodes.forEach(function(parameterNode, i) {
		var variableNode = parameterNode.children[0]
		var variableName = variableNode.children[0]

		if (i < argumentNodes.length) {
			this.scope.define(variableName, argumentNodes[i])
		} else {
			var valueNode = parameterNode.children[1]
			if (!valueNode)
				valueNode = Node('null', {loc: mixinCallNode.loc})

			this.scope.define(variableName, valueNode)
		}
	}, this)

	var ruleListClone = Node.clone(mixinNode.children[1])
	var childNodes = this.visit(ruleListClone.children)

	this.scope.remove()

	return childNodes
}