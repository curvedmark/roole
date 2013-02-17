/**
 * Media Filter
 *
 * Find media nodes existing before the passed extend node
 * and matching the passed media query list node.
 */
'use strict'

var _ = require('../helper')
var Node = require('../node')
var Visitor = require('../visitor')

var MediaFilter = module.exports = function() {}

MediaFilter.stop = {}

MediaFilter.prototype = new Visitor()
MediaFilter.prototype.constructor = MediaFilter

MediaFilter.prototype.filter = function(ast, mediaQueryListNode, options) {
	this.mediaQueryListNode = mediaQueryListNode
	this.mediaNodes = []

	try {
		this.visit(ast)
	} catch (error) {
		if (error !== MediaFilter.stop)
			throw error
	}

	return this.mediaNodes
}

MediaFilter.prototype.visitRoot =
MediaFilter.prototype.visitVoid =
MediaFilter.prototype.visitRuleset =
MediaFilter.prototype.visitRuleList = MediaFilter.prototype.visitNode

MediaFilter.prototype.visitNode = _.noop

MediaFilter.prototype.visitMedia = function(mediaNode) {
	var mediaQueryListNode = mediaNode.children[0]
	var ruleListNode = mediaNode.children[1]

	if (mediaQueryListNode === this.mediaQueryListNode) {
		this.mediaNodes.push(mediaNode)
		throw MediaFilter.stop
	}

	if (Node.equal(mediaQueryListNode, this.mediaQueryListNode))
		this.mediaNodes.push(mediaNode)
	else
		this.visit(ruleListNode)
}