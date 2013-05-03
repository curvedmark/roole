/**
 * Importer
 *
 * Import files specified in the import nodes.
 */
'use strict';

var _ = require('../helper');
var Node = require('../node');
var Visitor = require('../visitor');
var Parser = require('../parser');
var loader = require('./fs-loader');
module.exports = Importer;

function Importer(options) {
	this.options = options;
}

Importer.prototype = new Visitor();

Importer.prototype.import = function(ast, callback) {
	this.imported = {};
	this.ast = ast;
	this.callback = callback;
	this.importing = 0;

	try {
		this.visit(ast);
	} catch (error) {
		return callback(error);
	}

	if (!this.importing) {
		callback(null, ast);
	}
};

Importer.prototype.visitRoot =
Importer.prototype.visitRuleset =
Importer.prototype.visitMedia =
Importer.prototype.visitVoid =
Importer.prototype.visitIf =
Importer.prototype.visitFor =
Importer.prototype.visitAssignment =
Importer.prototype.visitMixin =
Importer.prototype.visitBlock =
Importer.prototype.visitModule =
Importer.prototype.visitRuleList = Importer.prototype.visitNode;

Importer.prototype.visitNode = _.noop;

Importer.prototype.visitImport = function(importNode) {
	var mediaQueryListNode = importNode.children[1];
	if (mediaQueryListNode) {
		return;
	}

	var urlNode = importNode.children[0];
	if (urlNode.type !== 'string' || urlNode.children.length !== 1) {
		return;
	}

	var filename = urlNode.children[0];
	if (/^\w+:\/\//.test(filename)) {
		return;
	}

	if (!/\.[a-z]+$/i.test(filename)) {
		filename += '.roo';
	}
	filename = _.joinPaths(_.dirname(importNode.loc.filename), filename);

	if (this.imported[filename]) {
		return null;
	}

	this.imported[filename] = true;
	var options = _.mixin({}, this.options, {
		filename: filename,
	});

	var content = this.options.imports[filename];
	if (typeof content === 'string') {
		var ast = new Parser(options).parse(content);
		return this.visit(ast);
	}

	++this.importing;

	var callback = this.callback;

	loader.load(filename, function(error, content) {
		if (this.hasError) {
			return;
		}

		if (error) {
			this.hasError = true;
			return callback(error);
		}

		var rootNode;
		try {
			this.options.imports[filename] = content;
			rootNode = new Parser(options).parse(content);
			this.visit(rootNode);
		} catch (error) {
			this.hasError = true;
			return callback(error);
		}

		Node.replace(rootNode, importNode);

		if (!--this.importing) {
			callback(null, this.ast);
		}
	}, this);
};