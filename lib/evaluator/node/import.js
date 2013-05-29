'use strict';

var P = require('p-promise');
var _ = require('../../helper');
var loader = require('../loader');
var Parser = require('../../parser');

module.exports = function (evaluator, importNode) {
	return evaluator.visit(importNode.children).then(function (children) {
		var mqList = children[1];
		if (mqList) return;

		var url = children[0];
		if (url.type !== 'string') return;

		var filename = url.children[0];
		if (/^\w+:\/\//.test(filename)) return;
		if (!/\.[a-z0-9]+$/i.test(filename)) filename += '.roo';
		var dirname = _.dirname(importNode.loc.filename);
		filename = _.joinPaths(dirname, filename);

		if (evaluator.imported[filename]) return null;
		evaluator.imported[filename] = true;
		var data = evaluator.options.imports[filename];
		if (typeof data === 'string') return process(data);

		var deferred = P.defer();
		loader.load(filename, function (err, data) {
			if (err) return deferred.reject(err);
			deferred.resolve(data);
		});
		return deferred.promise.then(function (data) {
			evaluator.options.imports[filename] = data;
			return process(data);
		});

		function process(data) {
			var opts = { filename: filename };
			var stylesheet = new Parser(opts).parse(data);

			return evaluator.visit(stylesheet).then(function () {
				return stylesheet.children;
			});
		}
	});
};