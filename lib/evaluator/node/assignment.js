'use strict';

var Evaluator = require('../');

Evaluator.prototype.visitAssignment = function(assignmentNode) {
	var variableNode = assignmentNode.children[0];
	var variableName = variableNode.children[0];
	var operator = assignmentNode.children[1];
	var valueNode = this.visit(assignmentNode.children[2]);

	switch (operator) {
	case '?=':
		if (!this.scope.resolve(variableName)) {
			this.scope.define(variableName, valueNode);
		}
		return null;
	case '=':
		this.scope.define(variableName, valueNode);
		return null;
	}
	operator = operator.charAt(0);
	var oldValueNode = this.visit(variableNode);
	valueNode = this.visit({
		type: 'arithmetic',
		operator: operator,
		children: [oldValueNode, valueNode],
		loc: assignmentNode.loc,
	});
	this.scope.define(variableName, valueNode);
	return null;
};