'use strict';

var roole = require('../lib/roole');

var assert = exports;

assert.compileTo = function(options, input, css) {
	if (arguments.length < 3) {
		css = input;
		input = options;
		options = {};
	}

	options.prettyError = true;

	var called = false;

	roole.compile(input, options, function(error, output) {
		called = true;

		if (error)
			throw error;

		if (output !== css) {
			error = new Error('');
			error.actual = output;
			error.expected = css;

			output = output ? '\n"""\n' + output + '\n"""\n' : ' ' + output + '\n';
			css = css ? '\n"""\n' + css + '\n"""' : ' empty string';
			error.message = 'input compiled to' + output + 'instead of' + css;

			throw error;
		}
	});

	if (!called)
		throw new Error('input is never compiled');
};

assert.failAt = function(options, input, loc) {
	if (arguments.length < 3) {
		loc = input;
		input = options;
		options = {};
	}

	options.prettyError = true;
	if (!loc.filePath) loc.filePath = '';

	var called = false;

	roole.compile(input, options, function(error) {
		if (!error)
			throw new Error('no error is thrown');

		if (!error.line)
			throw error;

		called = true;

		if (error.line !== loc.line) {
			var message = 'error has line number ' + error.line + ' instead of ' + loc.line;
			error.message = message + ':\n\n' + error.message;
			throw error;
		}

		if (error.column !== loc.column) {
			var message = 'error has column number ' + error.column + ' instead of ' + loc.column;
			error.message = message + ':\n\n' + error.message;
			throw error;
		}

		if (error.filePath !== loc.filePath) {
			var message = 'error has file path ' + error.filePath + ' instead of ' + loc.filePath;
			error.message = message + ':\n\n' + error.message;
			throw error;
		}
	});

	if (!called)
		throw new Error('input is never compiled');
};