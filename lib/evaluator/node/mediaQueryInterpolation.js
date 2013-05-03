'use strict';

var _ = require('../../helper');
var Parser = require('../../parser');
var Evaluator = require('../');

Evaluator.prototype.visitMediaInterpolation = function(mediaInterpolationNode) {
	this.visit(mediaInterpolationNode.children);

	var valueNode = mediaInterpolationNode.children[0];
	if (valueNode.type !== 'string') {
		mediaInterpolationNode.type = 'mediaType';
		return;
	}

	var value = valueNode.children[0].trim();
	var options = _.mixin({}, this.options, {
		startRule: 'mediaQuery',
		loc: valueNode.loc
	});
	var mediaQueryNode;

	try{
		mediaQueryNode = new Parser(options).parse(value);
	} catch (error) {
		error.message = 'error parsing media query interpolation: ' + error.message;
		throw error;
	}

	this.interpolatingMediaQuery = true;
	mediaQueryNode = this.visit(mediaQueryNode);
	this.interpolatingMediaQuery = false;

	return mediaQueryNode;
};