'use strict';

var Err = require('../../err');
var Node = require('../../node');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitModule = function(moduleNode) {
	var parentModuleName = this.parentModuleName || '';

	var nameNode = this.visit(moduleNode.children[0]);
	var name = Node.toString(nameNode);
	if (name === null) {
		throw Err("'" + nameNode.type + "' can not be used as a module name" , nameNode, this.filename);
	}

	var separatorNode = this.visit(moduleNode.children[1]);
	var separator = separatorNode ? Node.toString(separatorNode) : '-';
	if (separator === null) {
		throw Err("'" + separatorNode.type + "' can not be used as a module name separator" , separatorNode, this.filename);
	}

	this.parentModuleName = parentModuleName + name + separator;

	var ruleListNode = this.visit(moduleNode.children[2]);

	this.parentModuleName = parentModuleName;

	return ruleListNode.children;
};