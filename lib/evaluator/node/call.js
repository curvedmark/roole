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

	if (functionNode.type !== 'function') {
		throw Err("'" + functionNode.type + "' is not a 'function'", functionNode, this.filename);
	}

	this.scope.add();

	var argumentListNode = this.visit(callNode.children[1]);
	var argumentNodes = argumentListNode.children;

	var listNode = Node.toListNode(argumentListNode);
	this.scope.define('arguments', listNode);

	var parameterListNode = functionNode.children[0];
	var parameterNodes = parameterListNode.children;

	parameterNodes.forEach(function(parameterNode, i) {
		var variableNode = parameterNode.children[0];
		var variableName = variableNode.children[0];

		if (parameterNode.type === 'restParameter') {
			var argListNode = Node('argumentList', argumentNodes.slice(i), {loc: argumentListNode.loc});
			var listNode = Node.toListNode(argListNode);
			this.scope.define(variableName, listNode);
		} else if (i < argumentNodes.length) {
			this.scope.define(variableName, argumentNodes[i]);
		} else {
			var valueNode = parameterNode.children[1];
			if (!valueNode) { valueNode = Node('null', {loc: argumentListNode.loc}); }

			this.scope.define(variableName, valueNode);
		}
	}, this);

	var ruleListClone = Node.clone(functionNode.children[1]);

	var insideFunction = this.insideFunction;
	this.insideFunction = true;

	if (this.insideMixin) {
		return this.visit(ruleListClone).children;
	}

	var returnedNode;
	try {
		this.visit(ruleListClone);
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}

		returnedNode = error;
	}

	if (!returnedNode) {
		returnedNode = Node('null', {loc: callNode.loc});
	}

	this.insideFunction = insideFunction;

	this.scope.remove();

	return returnedNode;
};