'use strict';

var Err = require('../../err');
var Node = require('../../node');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitCall = function(callNode) {
	var functionNode = this.visit(callNode.children[0]);

	if (functionNode.type === 'identifier') {
		this.visit(callNode.children[1]);
		callNode.children[0] = functionNode.children[0];
		return;
	}

	if (functionNode.type !== 'function')
		throw new Err("'" + functionNode.type + "' is not a 'function'", functionNode, this.filePath);

	this.scope.add();

	var argumentListNode = this.visit(callNode.children[1]);
	var argumentNodes = argumentListNode.children;

	var parameterListNode = functionNode.children[0];
	var parameterNodes = parameterListNode.children;

	parameterNodes.forEach(function(parameterNode) {
		var variableNode = parameterNode.children[0];
		var variableName = variableNode.children[0];

		if (parameterNode.type === 'restParameter') {
			if (!argumentNodes.length) {
				var valueNode = new Node('null', {loc: argumentListNode.loc});
				this.scope.define(variableName, valueNode);
			} else {
				var listNode = new Node('list', [argumentNodes.shift()], {loc: argumentListNode.loc});
				argumentNodes.forEach(function(argumentNode) {
					var separatorNode = new Node('separator', [','], {loc: argumentListNode.loc});
					listNode.children.push(separatorNode, argumentNode);
				});
				this.scope.define(variableName, listNode);
			}
		} else if (argumentNodes.length) {
			this.scope.define(variableName, argumentNodes.shift());
		} else {
			var valueNode = parameterNode.children[1];
			if (!valueNode)
				valueNode = new Node('null', {loc: argumentListNode.loc});

			this.scope.define(variableName, valueNode);
		}
	}, this);

	var ruleListClone = Node.clone(functionNode.children[1]);

	var insideFunction = this.insideFunction;
	this.insideFunction = true;

	if (this.insideMixin)
		return this.visit(ruleListClone).children;

	var returnedNode;
	try {
		this.visit(ruleListClone);
	} catch (error) {
		if (!(error instanceof Node))
			throw error;

		returnedNode = error;
	}

	if (!returnedNode)
		returnedNode = new Node('null', {loc: callNode.loc});

	this.insideFunction = insideFunction;

	this.scope.remove();

	return returnedNode;
};