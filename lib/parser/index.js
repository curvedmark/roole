'use strict';

var generatedParser = require('./generatedParser');
var parser = exports;

parser.parse = function(input, options) {
	var fileName = options.fileName;

	try {
		var ast = generatedParser.parse(input, options);
		if (ast.type === 'root') { ast.fileName = fileName; }

		return ast;
	} catch(error) {
		if (error.line) {
			var found = error.found;
			switch (found) {
			case '\r':
			case '\n':
				found = 'new line';
				break;
			default:
				if (!found) {
					found = 'end of file';
				} else {
					found = "'" + found + "'";
				}
			}
			error.message = "unexpected " + found;
			error.fileName = fileName;

			if (options.loc) {
				error.line = options.loc.line;
				error.column = options.loc.column;
				error.offset = options.loc.offset;
			}
		}

		throw error;
	}
};