'use strict';

var assert = require('../assert');

suite('Command Line');

test('roole', function(done) {
	assert.run('roole', {
		stdin: 'body {margin: 1px}',
	}, {
		stdout: [
			'body {',
			'	margin: 1px;',
			'}',
		],
		done: done,
	});
});

test('roole file', function(done) {
	assert.run('roole foo.roo', {
		files: {
			'foo.roo': 'body {margin: 1px}',
		},
	}, {
		files: {
			'foo.css': [
				'body {',
				'	margin: 1px;',
				'}',
			],
		},
		done: done,
	});
});

test('roole files...', function(done) {
	assert.run('roole foo.roo bar.roo', {
		files: {
			'foo.roo': 'body {margin: 1px}',
			'bar.roo': 'body {margin: 2px}',
		},
	}, {
		files: {
			'foo.css': [
				'body {',
				'	margin: 1px;',
				'}',
			],
			'bar.css': [
				'body {',
				'	margin: 2px;',
				'}',
			],
		},
		done: done,
	});
});

test('roole empty-file', function(done) {
	assert.run('roole foo.roo', {
		files: {
			'foo.roo': '',
		},
	}, {
		files: {
			'foo.css': null,
		},
		done: done,
	});
});

test('roole empty-files...', function(done) {
	assert.run('roole foo.roo bar.roo', {
		files: {
			'foo.roo': 'body {margin: 1px}',
			'bar.roo': '',
		},
	}, {
		files: {
			'foo.css': [
				'body {',
				'	margin: 1px;',
				'}',
			],
			'bar.css': null,
		},
		done: done,
	});
});

test('roole importing-file', function(done) {
	assert.run('roole bar.roo', {
		files: {
			'foo.roo': 'body {margin: 1px}',
			'bar.roo': '@import "foo.roo";',
		},
	}, {
		files: {
			'bar.css': [
				'body {',
				'	margin: 1px;',
				'}',
			],
		},
		done: done,
	});
});

test('roole -f empty-file', function(done) {
	assert.run('roole -f foo.roo', {
		files: {
			'foo.roo': '',
		},
	}, {
		files: {
			'foo.css': '',
		},
		done: done,
	});
});

test('roole dir', function(done) {
	assert.run('roole foo', {
		files: {
			'foo/foo.roo': 'body {margin: 1px}',
			'foo/bar.roo': 'body {margin: 2px}',
		},
	}, {
		files: {
			'foo/foo.css': [
				'body {',
				'	margin: 1px;',
				'}',
			],
			'foo/bar.css': [
				'body {',
				'	margin: 2px;',
				'}',
			],
		},
		done: done,
	});
});

test('roole -o dir files...', function(done) {
	assert.run('roole -o foo foo.roo bar.roo', {
		files: {
			'foo.roo': 'body {margin: 1px}',
			'bar.roo': 'body {margin: 2px}',
		},
	}, {
		files: {
			'foo/foo.css': [
				'body {',
				'	margin: 1px;',
				'}',
			],
			'foo/bar.css': [
				'body {',
				'	margin: 2px;',
				'}',
			],
		},
		done: done,
	});
});

test('roole -o dir empty-files...', function(done) {
	assert.run('roole -o foo foo.roo bar.roo', {
		files: {
			'foo.roo': 'body {margin: 1px}',
			'bar.roo': '',
		},
	}, {
		files: {
			'foo/foo.css': [
				'body {',
				'	margin: 1px;',
				'}',
			],
			'foo/bar.css': null,
		},
		done: done,
	});
});

test('roole -o dir dir', function(done) {
	assert.run('roole -o foo bar', {
		files: {
			'bar/foo.roo': 'body {margin: 1px}',
			'bar/baz/baz.roo': 'body {margin: 2px}',
		},
	}, {
		files: {
			'foo/foo.css': [
				'body {',
				'	margin: 1px;',
				'}',
			],
			'foo/baz/baz.css': [
				'body {',
				'	margin: 2px;',
				'}',
			],
		},
		done: done,
	});
});

test('roole -p files...', function(done) {
	assert.run('roole -p foo.roo bar.roo', {
		files: {
			'foo.roo': 'body {margin: 1px}',
			'bar.roo': 'body {margin: 2px}',
		},
	}, {
		stdout: [
			'body {',
			'	margin: 1px;',
			'}',
			'',
			'body {',
			'	margin: 2px;',
			'}',
		],
		done: done,
	});
});

test('roole --prefix "webkit"', function(done) {
	assert.run('roole --prefix "webkit"', {
		stdin: 'body {box-sizing: border-box}',
	}, {
		stdout: [
			'body {',
			'	-webkit-box-sizing: border-box;',
			'	box-sizing: border-box;',
			'}',
		],
		done: done,
	});
});

test('roole --prefix ""', function(done) {
	assert.run('roole --prefix ""', {
		stdin: 'body {box-sizing: border-box}',
	}, {
		stdout: [
			'body {',
			'	box-sizing: border-box;',
			'}',
		],
		done: done,
	});
});

test('roole --indent "  "', function(done) {
	assert.run('roole --indent "  "', {
		stdin: 'body {margin: 1px}',
	}, {
		stdout: [
			'body {',
			'  margin: 1px;',
			'}',
		],
		done: done,
	});
});

test('roole --precision 5', function(done) {
	assert.run('roole --precision 5', {
		stdin: 'body {margin: 1px / 3}',
	}, {
		stdout: [
			'body {',
			'	margin: 0.33333px;',
			'}',
		],
		done: done,
	});
});

test('roole --skip-prefixed', function(done) {
	assert.run('roole --skip-prefixed', {
		stdin: [
			'body {',
			'	-moz-box-sizing: padding-box;',
			'	box-sizing: border-box;',
			'}',
		]
	}, {
		stdout: [
			'body {',
			'	-moz-box-sizing: padding-box;',
			'	-webkit-box-sizing: border-box;',
			'	box-sizing: border-box;',
			'}',
		],
		done: done,
	});
});