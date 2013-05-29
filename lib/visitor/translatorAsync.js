/**
 * Visitor
 *
 * Visit each node in the ast.
 */
'use strict';

var P = require('p-promise');
var Translator = require('./translator');

module.exports = TranslatorAsync;

function TranslatorAsync() {}

TranslatorAsync.prototype = new Translator();

TranslatorAsync.prototype._visitNodes = function (nodes, i) {
	if (i === undefined) i = 0;
	if (i >= nodes.length) return P(nodes);

	return P().then(this._visit.bind(this, nodes[i])).then(function (ret) {
		i = this._replaceNode(ret, i, nodes);
		return this._visitNodes(nodes, i);
	}.bind(this));
};

TranslatorAsync.prototype._visitNode = function (node) {
	return P().then(this._visit.bind(this, node)).then(function (ret) {
		if (ret === undefined) ret = node;
		return ret;
	});
};