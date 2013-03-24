/**
 * Importer
 *
 * Import files specified in the import nodes.
 */
'use strict';

var _ = require('../helper');
var Node = require('../node');
var Visitor = require('../visitor');
var loader = require('./fs-loader');
var parser = require('../parser');
var Importer = module.exports = function() {};

Importer.prototype = new Visitor();

Importer.prototype.import = function(ast, options, callback) {
	this.imports = options.imports;
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

Importer.prototype.visitRoot = function(rootNode) {
	var fileName = this.fileName;
	this.fileName = rootNode.fileName;

	this.visit(rootNode.children);

	this.fileName = fileName;
};

Importer.prototype.visitImport = function(importNode) {
	var mediaQueryListNode = importNode.children[1];
	if (mediaQueryListNode) {
		return;
	}

	var urlNode = importNode.children[0];
	if (urlNode.type !== 'string' || urlNode.children.length !== 1) {
		return;
	}

	var fileName = urlNode.children[0];
	if (/^\w+:\/\//.test(fileName)) {
		return;
	}

	if (!/\.[a-z]+$/i.test(fileName)) {
		fileName += '.roo';
	}
	fileName = _.joinPaths(_.dirname(this.fileName), fileName);

	if (this.imported[fileName]) {
		return null;
	}

	this.imported[fileName] = true;

	var content = this.imports[fileName];
	if (typeof content === 'string') {
		var ast = parser.parse(content, {fileName: fileName});
		return this.visit(ast);
	}

	++this.importing;

	var callback = this.callback;

	loader.load(fileName, function(error, content) {
		if (this.hasError) {
			return;
		}

		if (error) {
			this.hasError = true;
			return callback(error);
		}

		var rootNode;
		try {
			this.imports[fileName] = content;
			rootNode = parser.parse(content, {fileName: fileName});
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