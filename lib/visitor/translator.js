/**
 * Translator
 *
 * Translate each node in the ast.
 *
 * When translating an array of node, actions can return a value to
 * modify the corresponding node:
 *
 * `null` - remove the node
 * `undefined` - do nothing
 * Array - replace the node with the shallowly flattened array
 * others - replace the node with the returned value
 */
'use strict';

var Visitor = require('./');

module.exports = Translator;

function Translator() {}

Translator.prototype = new Visitor();

Translator.prototype.visit = function (node) {
	if (Array.isArray(node)) return this._visitNodes(node);
	return this._visitNode(node);
};

Translator.prototype._visitNodes = function (nodes) {
	var i = 0;
	while (i < nodes.length) {
		var ret = this._visit(nodes[i]);
		i = this._replaceNode(ret, i, nodes);
	}
	return nodes;
};

Translator.prototype._visitNode = function(node) {
	var ret = this._visit(node);
	if (ret === undefined) ret = node;
	return ret;
};

Translator.prototype._replaceNode = function (ret, i, nodes) {
	if (ret === null) {
		if (nodes[i] === null) return i + 1;
		nodes.splice(i, 1);
		return i;
	}
	if (Array.isArray(ret)) {
		nodes.splice.apply(nodes, [i, 1].concat(ret));
		return i + ret.length;
	}
	if (ret !== undefined) nodes[i] = ret;
	return i + 1;
};