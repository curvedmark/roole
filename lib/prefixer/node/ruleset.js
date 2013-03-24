'use strict';

var Prefixer = require('../prefixer');

Prefixer.prototype.visitRuleset = function(rulesetNode) {
	var ruleListNode = rulesetNode.children[1];

	if (this.skipPrefixed) {
		var properties = this.properties;
		this.properties = ruleListNode.children;

		this.visit(ruleListNode.children);

		this.properties = properties;
	} else {
		this.visit(ruleListNode.children);
	}
};