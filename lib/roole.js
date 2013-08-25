var Promise = require('promise-now');
var parser = require('roole-parser');
var evaluator = require('roole-evaluator');
var prefixer = require('roole-prefixer');
var compiler = require('roole-compiler');
var pinpoint = require('pinpoint');

exports.compile = function(input, options, callback) {
	if (typeof options === 'function') {
		callback = options;
		options = {};
	}

	var promise = new Promise().fulfill().then(function () {
		var ast = parser.parse(input, options);
		return evaluator.evaluate(ast, options);
	}).then(function (ast) {
		prefixer.prefix(ast, options);
		return compiler.compile(ast, options);
	});

	if (!callback) return promise;

	promise.done(function (output) {
		callback(null, output);
	}, function (err) {
		if (err.loc && options.prettyError) {
			var filename = err.loc.filename;

			var imported = options.imports && options.imports[filename];
			if (imported) input = imported;

			var line = err.loc.line;
			var column = err.loc.column;
			var code = pinpoint(input, {
				line: line,
				column: column,
				indent: options.prettyErrorIndent
			});
			err.message += '\n(' + filename + ':' + line + ':' + column + ')\n\n'
				+ code + '\n\n';
		}
		callback(err);
	});
};

exports.builtin = evaluator.builtin;