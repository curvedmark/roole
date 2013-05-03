'use strict';

var Compiler = require('../');

Compiler.prototype.visitMediaType = function(mediaType) {
	var modifier = mediaType.modifier || '';
	if (modifier) modifier += ' ';
	var name = this.visit(mediaType.children[0]);

	return modifier + name;
};