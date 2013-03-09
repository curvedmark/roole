'use strict';

var Err = require('../../err');
var compiler = require('../../compiler');
var Extender = require('../extender');

Extender.prototype.visitSelector = function(selectorNode) {
	var hasAmpersandSelector = false;
	var startWithCombinator = false;

	var selector = '';
	selectorNode.children.forEach(function(childNode, i) {
		switch (childNode.type) {
		case 'ampersandSelector':
			if (!this.parentSelector)
				throw Err("& selector is not allowed at the top level", childNode, this.filePath);

			hasAmpersandSelector = true;
			selector += this.parentSelector;
			var valueNode =  childNode.children[0];
			if (valueNode)
				selector += valueNode.children[0];
			break;

		case 'combinator':
			if (!i) {
				if (!this.parentSelector)
					throw Err("selector starting with a combinator is not allowed at the top level", childNode, this.filePath);

				startWithCombinator = true;
			}
			selector += compiler.compile(childNode);
			break;

		default:
			selector += compiler.compile(childNode);
		}
	}, this);

	if (hasAmpersandSelector)
		return selector;

	if (startWithCombinator)
		return this.parentSelector + selector;

	return  this.parentSelector ? this.parentSelector + ' ' + selector : selector;
};