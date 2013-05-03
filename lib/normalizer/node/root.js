'use strict';

var Normalizer = require('../normalizer');

Normalizer.prototype.visitRoot = function(rootNode) {
	return this.visit(rootNode.children);
};