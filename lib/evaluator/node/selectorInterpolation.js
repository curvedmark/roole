'use strict';

var parser = require('../../parser');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitSelectorInterpolation = function(selectorInterpolationNode) {
	this.visit(selectorInterpolationNode.children);

	var valueNode = selectorInterpolationNode.children[0];
	if (valueNode.type !== 'string') {
		selectorInterpolationNode.type = 'typeSelector';
		return;
	}

	var value = valueNode.children[0].trim();
	var options = {
		filename: this.filename,
		startRule: 'selector',
		loc: valueNode.loc
	};
	var selectorNode;

	try{
		selectorNode = parser.parse(value, options);
	} catch (error) {
		error.message = 'error parsing selector interpolation: ' + error.message;
		throw error;
	}

	return selectorNode.children;
};