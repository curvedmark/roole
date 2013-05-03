'use strict';

var Prefixer = require('../');

Prefixer.prototype.visitRuleset = function(rulesetNode) {
	var ruleListNode = rulesetNode.children[1];

	if (this.options.skipPrefixed) {
		var properties = this.properties;
		this.properties = ruleListNode.children;

		this.visit(ruleListNode.children);

		this.properties = properties;
	} else {
		this.visit(ruleListNode.children);
	}
};