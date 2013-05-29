/**
 * Roole
 *
 * Expose public APIs.
 */
'use strict';

var _ = require('./helper');
var P = require('p-promise');
var Parser = require('./parser');
var Evaluator = require('./evaluator');
var Prefixer = require('./prefixer');
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
	if (typeof options === 'function') {
		callback = options;
		options = {};
	} else if (!options) {
		options = {};
	}
	options = _.mixin({}, roole.defaults, options);
	options.imports[options.filename] = input;

	var promise = P().then(function () {
		var node = new Parser(options).parse(input);
		return new Evaluator(options).evaluate(node);
	}).then(function (node) {
		new Prefixer(options).prefix(node);
		return new Compiler(options).compile(node);
	});

	if (!callback) return promise;
	return promise.then(function (output) {
		callback(null, output);
	}, function (err) {
		if (err.loc) {
			var input = options.imports[err.loc.filename];
			err.message = formatter.format(err, input);
		}
		callback(err);
	});
};