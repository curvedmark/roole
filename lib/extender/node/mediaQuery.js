'use strict';

var Extender = require('../');

Extender.prototype.visitMediaQuery = function(mediaQueryNode) {
	if (this.parentMediaQuery) {
		mediaQueryNode.children = this.parentMediaQuery.children.concat(mediaQueryNode.children);
	}
};