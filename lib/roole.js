/**
 * Roole
 *
 * Expose public APIs.
 */
'use strict';

var defaults = require('./defaults');
var parser = require('./parser');
var importer = require('./importer');
var evaluator = require('./evaluator');
var extender = require('./extender');
var normalizer = require('./normalizer');
var prefixer = require('./prefixer');
var compiler = require('./compiler');
var formatter = require('./formatter');
var roole = exports;

roole.version = require('../package.json').version;

roole.compile = function(input, options, callback) {
	if (callback == null) {
		callback = options;
		options = {};
	} else if (options == null) {
		options = {};
	}

	if (options.fileName == null) { options.fileName = ''; }
	if (options.imports == null) { options.imports = {}; }
	if (options.prettyError == null) { options.prettyError = defaults.prettyError; }

	options.imports[options.fileName] = input;

	if (options.prettyError) {
		var _callback = callback;
		callback = function(error, ast) {
			if (error && error.line) {
				input = options.imports[error.fileName];
				error.message = formatter.format(error, input);
			}

			_callback(error, ast);
		};
	}


	var ast, output;

	try {
		ast = parser.parse(input, options);
	} catch (error) {
		return callback(error);
	}

	importer.import(ast, options, function(error, ast) {
		if (error) {
			return callback(error);
		}

		try {
			ast = evaluator.evaluate(ast, options);
			ast = extender.extend(ast, options);
			ast = normalizer.normalize(ast, options);
			ast = prefixer.prefix(ast, options);
			output = compiler.compile(ast, options);
		} catch (error) {
			return callback(error);
		}

		callback(null, output);
	});
};