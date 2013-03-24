'use strict';

var parser = require('../../parser');
var Evaluator = require('../evaluator');

Evaluator.prototype.visitMediaInterpolation = function(mediaInterpolationNode) {
	this.visit(mediaInterpolationNode.children);

	var valueNode = mediaInterpolationNode.children[0];
	if (valueNode.type !== 'string') {
		mediaInterpolationNode.children.unshift(null);
		mediaInterpolationNode.type = 'mediaType';
		return;
	}

	var value = valueNode.children[0].trim();
	var options = {
		fileName: this.fileName,
		startRule: 'mediaQuery',
		loc: valueNode.loc
	};
	var mediaQueryNode;

	try{
		mediaQueryNode = parser.parse(value, options);
	} catch (error) {
		error.message = 'error parsing media query interpolation: ' + error.message;
		throw error;
	}

	this.interpolatingMediaQuery = true;
	mediaQueryNode = this.visit(mediaQueryNode);
	this.interpolatingMediaQuery = false;

	return mediaQueryNode;
};