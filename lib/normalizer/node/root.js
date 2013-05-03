'use strict';

var Normalizer = require('../');

Normalizer.prototype.visitRoot = function(rootNode) {
	return this.visit(rootNode.children);
};