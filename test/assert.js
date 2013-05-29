'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var mkdirp = require('mkdirp');
var _ = require('../lib/helper');
var roole = typeof window === 'undefined' ? global.roole : window.roole;
var assert = exports;

assert.compileTo = function(options, input, css) {
    if (arguments.length < 3) {
        css = input;
        input = options;
        options = {};
    }

    if (Array.isArray(input)) {
        var imports = input;
        input = imports.pop();
        var files = {};
        imports.forEach(function (file) {
            _.mixin(files, file);
        });
        options.imports = files;
    }

    if (css) css += '\n';
    options.prettyError = true;

    return roole.compile(input, options).then(function (output) {
        if (output === css) return;
        var err = new Error('');
        err.actual = output;
        err.expected = css;
        err.showDiff = true;

        output = output ? '\n"""\n' + output + '\n"""\n' : ' ' + output + '\n';
        css = css ? '\n"""\n' + css + '\n"""' : ' empty string';
        err.message = 'input compiled to' + output + 'instead of' + css;

        throw err;
    });
};

assert.failAt = function(options, input, loc) {
    if (arguments.length < 3) {
        loc = input;
        input = options;
        options = {};
    }

    if (Array.isArray(input)) {
        var imports = input;
        input = imports.pop();
        var files = {};
        imports.forEach(function (file) {
            _.mixin(files, file);
        });
        options.imports = files;
    }

    options.prettyError = true;

    if (!loc.filename) { loc.filename = ''; }

    return roole.compile(input, options).then(function () {
        throw new Error('no error is thrown');
    }, function (err) {
        if (!err.loc) throw err;
        if (err.loc.line !== loc.line) {
            var message = 'error has line number ' + err.loc.line + ' instead of ' + loc.line;
            err.message = message + ':\n\n' + err.message;
            throw err;
        }
        if (err.loc.column !== loc.column) {
            var message = 'error has column number ' + err.loc.column + ' instead of ' + loc.column;
            err.message = message + ':\n\n' + err.message;
            throw err;
        }
        if (err.loc.filename !== loc.filename) {
            var message = 'error has file path ' + err.loc.filename + ' instead of ' + loc.filename;
            err.message = message + ':\n\n' + err.message;
            throw err;
        }
    });
};

assert.compileToWithCmd = function(cmd, input, output, done) {
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

					if (fs.existsSync(filename)) {
						if (fileContent === null) {
							return callback(new Error('"' + name + '" is created, which is not supposed to be'));
						}

						if (fileContent) fileContent += '\n';
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