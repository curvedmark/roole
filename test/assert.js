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

	options.prettyError = true;

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

	options.prettyError = true;

	if (!loc.filename) { loc.filename = ''; }

	var called = false;
	roole.compile(input, options, function(error) {
		if (!error) {
			throw new Error('no error is thrown');
		}

		if (!error.loc) {
			throw error;
		}

		called = true;

		if (error.loc.line !== loc.line) {
			var message = 'error has line number ' + error.line + ' instead of ' + loc.line;
			error.message = message + ':\n\n' + error.message;
			throw error;
		}

		if (error.loc.column !== loc.column) {
			var message = 'error has column number ' + error.column + ' instead of ' + loc.column;
			error.message = message + ':\n\n' + error.message;
			throw error;
		}

		if (error.loc.filename !== loc.filename) {
			var message = 'error has file path ' + error.filename + ' instead of ' + loc.filename;
			error.message = message + ':\n\n' + error.message;
			throw error;
		}
	});

	if (!called) {
		throw new Error('input is never compiled');
	}
};

assert.compileToWithCmd = function(cmd, input, output, done) {
	var existsSync = fs.existsSync || path.existsSync;

	var dir = 'test-dir';

	var callback = function(error) {
		if (error) {
			return done(error);
		}
		exec('rm -rf ' + dir, function() {
			done();
		});
	};

	exec('rm -rf ' + dir, function() {
		mkdirp.sync(dir);

		if (typeof input !== 'string') {
			for (var filename in input) {
				var fileContent = input[filename];
				filename = path.join(dir, filename);

				var fileDir = path.dirname(filename);
				mkdirp.sync(fileDir);

				fs.writeFileSync(filename, fileContent);
			}
		}

		var child = exec('../bin/' + cmd, {cwd: dir}, function(error, stdout) {
			if (error) {
				return callback(error);
			}

			if (typeof output === 'string') {
				output += '\n';
				stdout = stdout.toString();
				if (stdout !== output) {
					return callback(new Error('stdout is\n"""\n' + stdout + '\n"""\n\ninstead of\n\n"""\n' + output + '\n"""'));
				}
			} else {
				for (var filename in output) {
					var fileContent = output[filename];
					filename = path.join(dir, filename);
					var name = filename.substr(dir.length + 1);

					if (existsSync(filename)) {
						if (fileContent === null) {
							return callback(new Error('"' + name + '" is created, which is not supposed to be'));
						}

						var realContent = fs.readFileSync(filename, 'utf8');

						if (realContent !== fileContent) {
							return callback(new Error('"' + name + '" compiled to\n"""\n' + realContent + '\n"""\n\ninstead of\n\n"""\n' + fileContent + '\n"""'));
						}
					} else if (fileContent !== null) {
						return callback(new Error('"' + name + '" is not created'));
					}
				}
			}

			callback();
		});

		if (typeof input === 'string') {
			child.stdin.end(input);
		}
	});
};