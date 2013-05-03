'use strict';

var Compiler = require('../compiler');

Compiler.prototype.visitKeyframes = function(keyframesNode) {
	var css = '@';

	var prefix = keyframesNode.children[0];
	if (prefix) { css += '-' + prefix + '-'; }

	var nameNode = keyframesNode.children[1];
	css += 'keyframes ' + this.visit(nameNode) + ' ';

	var ruleListNode = keyframesNode.children[2];
	css += this.visit(ruleListNode);

	return css;
};