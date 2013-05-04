'use strict';

var RooleError = require('../../error');
var Node = require('../../node');
var Evaluator = require('../');

Evaluator.prototype.visitModule = function(moduleNode) {
	var parentModuleName = this.parentModuleName || '';

	var nameNode = this.visit(moduleNode.children[0]);
	var name = Node.toString(nameNode);
	if (name === null) {
		throw RooleError("'" + nameNode.type + "' can not be used as a module name" , nameNode);
	}

	var separatorNode = this.visit(moduleNode.children[1]);
	var separator = separatorNode ? Node.toString(separatorNode) : '-';
	if (separator === null) {
		throw RooleError("'" + separatorNode.type + "' can not be used as a module name separator" , separatorNode);
	}

	this.parentModuleName = parentModuleName + name + separator;

	var ruleListNode = this.visit(moduleNode.children[2]);

	this.parentModuleName = parentModuleName;

	return ruleListNode.children;
};