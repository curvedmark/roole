'use strict'

var _ = require('../../helper')
var Node = require('../../node')

var Prefixer = require('../prefixer')

Prefixer.prototype.visitKeyframes = function(keyframesNode) {
	var prefix = keyframesNode.children[0]
	if (prefix)
		return

	var keyframeNameNode = this.visit(keyframesNode.children[1])
	var keyframeListNode = keyframesNode.children[2]

	var prefixes = _.intersect(this.prefixes, ['webkit', 'moz', 'o'])

	var keyframesNodes = []

	prefixes.forEach(function(prefix) {
		this.prefixes = [prefix]
		var keyframeListClone = Node.clone(keyframeListNode)
		this.visit(keyframeListClone)

		var keyframesClone = Node.clone(keyframesNode, false)
		keyframesClone.children = [prefix, keyframeNameNode, keyframeListClone]

		keyframesNodes.push(keyframesClone)
	}, this)

	keyframesNodes.push(keyframesNode)

	return keyframesNodes
}