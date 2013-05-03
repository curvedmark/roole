'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitUrl = function(url) {
	url = this.visit(url.children[0]);
	return 'url(' + url + ')';
};