'use strict';

var _ = require('../../helper');
var Parser = require('../../parser');
var Evaluator = require('../');

Evaluator.prototype.visitSelectorInterpolation = function(selectorInterpolationNode) {
	this.visit(selectorInterpolationNode.children);

	var valueNode = selectorInterpolationNode.children[0];
	if (valueNode.type !== 'string') {
		selectorInterpolationNode.type = 'typeSelector';
		return;
	}

	var value = valueNode.children[0].trim();
	var options = _.mixin({}, this.options, {
		startRule: 'selector',
		loc: valueNode.loc
	});
	var selectorNode;

	try{
		selectorNode = new Parser(options).parse(value);
	} catch (error) {
		error.message = 'error parsing selector interpolation: ' + error.message;
		throw error;
	}

	return selectorNode.children;
};