var Promise = require('promise-now');
var parser = require('roole-parser');
var evaluator = require('roole-evaluator');
var prefixer = require('roole-prefixer');
var compiler = require('roole-compiler');
var pinpoint = require('pinpoint');
var plugins = [];

exports.compile = function(input, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = {};
	}

	var promise = new Promise().fulfill().then(function () {
		var ast = parser.parse(input, options);
		return evaluator.evaluate(ast, options);
	});
	plugins.forEach(function (plugin) {
		promise = promise.then(function (ast) {
			return plugin(ast, options);
		});
	});
	promise = promise.then(function (ast) {
		ast = prefixer.prefix(ast, options);
		return compiler.compile(ast, options);
	});

	if (!callback) return promise;

	promise.done(function (output) {
		callback(null, output);
	}, function (err) {
		if (err.loc) {
			err.context = function (indent) {
				var filename = err.loc.filename;

				var imported = options.imports && options.imports[filename];
				if (imported) input = imported;

				var line = err.loc.line;
				var column = err.loc.column;
				return pinpoint(input, {
					line: line,
					column: column,
					indent: indent
				});
			};
		}
		callback(err);
	});
};

exports.builtin = evaluator.Evaluator.builtin;

exports.use = function (func) {
	func(exports);
	return this;
};

exports.on = function (stage, func) {
	plugins.push(func);
	return this;
};