'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var mkdirp = require('mkdirp');
var roole = require('../lib/roole');
var assert = exports;

assert.compileTo = function(options, input, css) {
	if (arguments.length < 3) {
		css = input;
		input = options;
		options = {};
	}

	input = input.join('\n');
	css = css.join('\n');

	options.prettyError = true;
	if (options.imports) {
		for (var file in options.imports) {
			options.imports[file] = options.imports[file].join('\n');
		}
	}

	var called = false;
	roole.compile(input, options, function(error, output) {
		called = true;

		if (error) {
			throw error;
		}

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

	if (!called) {
		throw new Error('input is never compiled');
	}
};

assert.failAt = function(options, input, loc) {
	if (arguments.length < 3) {
		loc = input;
		input = options;
		options = {};
	}

	input = input.join('\n');

	options.prettyError = true;
	if (options.imports) {
		for (var file in options.imports) {
			options.imports[file] = options.imports[file].join('\n');
		}
	}

	if (!loc.filename) { loc.filename = ''; }

	var called = false;
	roole.compile(input, options, function(error) {
		if (!error) {
			throw new Error('no error is thrown');
		}

		if (!error.line) {
			throw error;
		}

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

		if (error.filename !== loc.filename) {
			var message = 'error has file path ' + error.filename + ' instead of ' + loc.filename;
			error.message = message + ':\n\n' + error.message;
			throw error;
		}
	});

	if (!called) {
		throw new Error('input is never compiled');
	}
};

assert.run = function(cmd, input, output) {
	var existsSync = fs.existsSync || path.existsSync;

	var dir = 'test-dir';
	mkdirp.sync(dir);

	if (Array.isArray(input.stdin)) {
		input.stdin = input.stdin.join('\n');
	}

	var done = output.done;
	var callback = function(error) {
		exec('rm -rf ' + dir, function() {
			done(error);
		});
	};

	if (input.files) {
		for (var filename in input.files) {
			var fileContent = input.files[filename];
			filename = path.join(dir, filename);

			if (existsSync(filename)) {
				return callback(new Error("'" + filename + "' already exists"));
			}

			var fileDir = path.dirname(filename);
			mkdirp.sync(fileDir);

			if (Array.isArray(fileContent)) {
				fileContent = fileContent.join('\n');
			}

			fs.writeFileSync(filename, fileContent);
		}
	}

	var child = exec('../bin/' + cmd, {cwd: dir}, function(error, stdout) {
		if (error) {
			return callback(error);
		}

		if (Array.isArray(output.stdout)) {
			output.stdout = output.stdout.join('\n');
		}

		if (output.stdout) {
			output.stdout += '\n';
			stdout = stdout.toString();
			if (stdout !== output.stdout) {
				return callback(new Error('stdout is\n"""\n' + stdout + '\n"""\n\ninstead of\n\n"""\n' + output.stdout + '\n"""'));
			}
		} else if (output.files) {
			for (var filename in output.files) {
				var fileContent = output.files[filename];
				filename = path.join(dir, filename);

				if (fileContent === null) {
					if (existsSync(filename)) {
						return callback(new Error('"' + filename + '" is created, which is not supposed to be'));
					}

					continue;
				}

				var realContent = fs.readFileSync(filename, 'utf8');

				if (Array.isArray(fileContent)) {
					fileContent = fileContent.join('\n');
				}

				if (realContent !== fileContent) {
					return callback(new Error('"' + filename + '" is\n"""\n' + realContent + '\n"""\n\ninstead of\n\n"""\n' + fileContent + '\n"""'));
				}
			}
		}

		callback();
	});

	if (input.stdin) {
		child.stdin.end(input.stdin);
	}
};