'use strict';

var _ = require('../../helper');
var Node = require('../../node');
var Prefixer = require('../prefixer');

Prefixer.prototype.visitKeyframes = function(keyframesNode) {
	var prefix = keyframesNode.prefix;
	if (prefix) {
		return;
	}

	var keyframeNameNode = this.visit(keyframesNode.children[0]);
	var keyframeListNode = keyframesNode.children[1];

	var prefixes = _.intersect(this.prefixes, ['webkit', 'moz', 'o']);

	var keyframesNodes = [];

	prefixes.forEach(function(prefix) {
		this.prefixes = [prefix];
		var keyframeListClone = Node.clone(keyframeListNode);
		this.visit(keyframeListClone);

		var keyframesClone = Node.clone(keyframesNode, false);
		keyframesClone.prefix = prefix;
		keyframesClone.children = [keyframeNameNode, keyframeListClone];

		keyframesNodes.push(keyframesClone);
	}, this);

	keyframesNodes.push(keyframesNode);

	return keyframesNodes;
};