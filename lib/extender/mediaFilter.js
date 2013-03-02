/**
 * Media Filter
 *
 * Find medias matching the passed media queries
 */
'use strict'

var _ = require('../helper')
var Node = require('../node')
var Visitor = require('../visitor')

var MediaFilter = module.exports = function() {}

MediaFilter.stop = {}

MediaFilter.prototype = new Visitor()

MediaFilter.prototype.filter = function(ast, mediaQueries, options) {
	this.mediaQueries = mediaQueries
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
	var mediaQueries = mediaQueryListNode.children
	var ruleListNode = mediaNode.children[1]

	if (mediaQueries === this.mediaQueries) {
		this.mediaNodes.push(mediaNode)
		throw MediaFilter.stop
	}

	if (Node.equal(mediaQueries, this.mediaQueries))
		this.mediaNodes.push(mediaNode)
	else
		this.visit(ruleListNode)
}