/**
 * Roole
 *
 * Expose public APIs.
 */
'use strict';

var _ = require('./helper');
var Parser = require('./parser');
var Importer = require('./importer');
var evaluator = require('./evaluator');
var extender = require('./extender');
var Normalizer = require('./normalizer');
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
		output = new Parser(options).parse(input);
	} catch (error) {
		return callback(error);
	}
	new Importer(options).import(output, function(error, output) {
		if (error) {
			return callback(error);
		}
		try {
			output = evaluator.evaluate(output, options);
			output = extender.extend(output, options);
			output = new Normalizer(options).normalize(output);
			output = prefixer.prefix(output, options);
			output = new Compiler(options).compile(output);
		} catch (error) {
			return callback(error);
		}
		callback(null, output);
	});
}