/**
 * Visitor
 *
 * Visit each node in the ast.
 *
 * Subclasses use `visit(node)` to visit nodes, `node` can be a single node
 * or an array of nodes.
 *
 * Subclasses should implement `_visit(node)`, which will
 * be called for each node in the ast being visited.
 */
'use strict';

module.exports = Visitor;

function Visitor() {}

Visitor.prototype.visit = function(node) {
	if (Array.isArray(node)) this._visitNodes(node);
	else this._visitNode(node);
};

Visitor.prototype._visitNodes = function (nodes) {
	nodes.forEach(this._visit.bind(this));
};

Visitor.prototype._visitNode = function(node) {
	this._visit(node);
};

Visitor.prototype._visit = function () {
	throw new Error('not implemented');
};