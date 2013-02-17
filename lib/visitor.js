/**
 * Visitor
 *
 * Visit each node in the ast.
 *
 * Other modules are expected to have Visitor.prototype in their prototype chain
 * to inherit its methods.
 */
'use strict'

var _ = require('./helper')

var Visitor = module.exports = function() {}

Visitor.prototype.visit = function(node) {
	if (Array.isArray(node))
		return this._visitNodes(node)

	var visitedNode = this._visitNode(node)
	if (visitedNode === undefined) visitedNode = node

	return visitedNode
}

Visitor.prototype._visitNode = function(node) {
	if (node === null || typeof node !== 'object')
		return

	var methodName = 'visit' + _.capitalize(node.type)
	var method = this[methodName] || this.visitNode
	return method.call(this, node)
}

Visitor.prototype._visitNodes = function(nodes) {
	var i = 0
	while (i < nodes.length) {
		var node = this._visitNode(nodes[i])

		if (node === undefined) {
			++i
			continue
		}

		if (node === null) {
			if (nodes[i] === null)
				++i
			else
				nodes.splice(i, 1)

			continue
		}

		if (!Array.isArray(node)) {
			nodes[i] = node
			++i

			continue
		}

		nodes.splice.apply(nodes, [i, 1].concat(node))
		i += node.length
	}
	return nodes
}

Visitor.prototype.visitNode = function(node) {
	if (node.children)
		this._visitNodes(node.children)
}