'use strict';

var RooleError = require('../../error');
var Node = require('../../node');
var Evaluator = require('../');

Evaluator.prototype.visitCall = function(callNode) {
	var functionNode = this.visit(callNode.children[0]);

	if (typeof functionNode === 'function') {
		this.visit(callNode.children[1]);
		return functionNode.call(this, callNode);
	}

	if (functionNode.type === 'identifier') {
		this.visit(callNode.children[1]);
		callNode.children[0] = functionNode.children[0];
		return;
	}

	if (functionNode.type !== 'function') {
		throw RooleError("'" + functionNode.type + "' is not a 'function'", functionNode);
	}

	var argumentListNode = this.visit(callNode.children[1]);
	var argumentNodes = argumentListNode.children;

	var scope = this.scope;
	this.scope = functionNode.scope;
	this.scope.add();

	var listNode = Node.toListNode(argumentListNode);
	this.scope.define('arguments', listNode);

	var parameterListNode = functionNode.children[0];
	var parameterNodes = parameterListNode.children;

	parameterNodes.forEach(function(parameterNode, i) {
		var variableNode = parameterNode.children[0];
		var variableName = variableNode.children[0];

		if (parameterNode.type === 'restParameter') {
			var argListNode = {
				type: 'argumentList',
				children: argumentNodes.slice(i),
				loc: argumentListNode.loc,
			};
			var listNode = Node.toListNode(argListNode);
			this.scope.define(variableName, listNode);
		} else if (i < argumentNodes.length) {
			this.scope.define(variableName, argumentNodes[i]);
		} else {
			var valueNode = parameterNode.children[1];
			if (!valueNode)
				valueNode = {
					type: 'null',
					loc: argumentListNode.loc,
				};

			this.scope.define(variableName, valueNode);
		}
	}, this);

	var ruleListClone = Node.clone(functionNode.children[1]);

	var context = this.context;

	var returnedNode;
	if (callNode.mixin) {
		this.context = 'mixin';
		returnedNode = this.visit(ruleListClone.children);
	} else {
		this.context = 'call';

		try {
			this.visit(ruleListClone);
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}

			returnedNode = error;
		}

		if (!returnedNode) {
			returnedNode = {
				type: 'null',
				loc: callNode.loc,
			};
		}
	}

	this.context = context;

	this.scope.remove();
	this.scope = scope;

	return returnedNode;
};