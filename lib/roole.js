/**
 * Roole
 *
 * Expose public APIs.
 */
'use strict';

var _ = require('./helper');
var parser = require('./parser');
var importer = require('./importer');
var evaluator = require('./evaluator');
var extender = require('./extender');
var normalizer = require('./normalizer');
var prefixer = require('./prefixer');
var Compiler = require('./compiler');
var formatter = require('./formatter');
var roole = exports;

roole.version = require('../package.json').version;

roole.defaults = {
	prefix: 'webkit moz ms o',
	indent: '\t',
	precision: 3,
	skipPrefixed: false,
	prettyError: false,
	filename: '',
	imports: {}
};

roole.compile = function(input, options, callback) {
	if (callback == null) {
		callback = options;
		options = {};
	} else if (options == null) {
		options = {};
	}

	options = _.mixin({}, roole.defaults, options);
	options.imports[options.filename] = input;
	if (options.prettyError) {
		var cb = callback;
		callback = function (error, output) {
			if (error && error.loc) {
				var input = options.imports[error.loc.filename];
				error.message = formatter.format(error, input);
			}
			cb(error, output);
		};
	}

	compile(input, options, callback);
};

function compile(input, options, callback) {
	var output;
	try {
		output = parser.parse(input, options);
	} catch (error) {
		return callback(error);
	}
	importer.import(output, options, function(error, output) {
		if (error) {
			return callback(error);
		}
		try {
			output = evaluator.evaluate(output, options);
			output = extender.extend(output, options);
			output = normalizer.normalize(output, options);
			output = prefixer.prefix(output, options);
			output = new Compiler(options).compile(output);
		} catch (error) {
			return callback(error);
		}
		callback(null, output);
	});
}