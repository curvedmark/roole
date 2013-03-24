'use strict';

var assert = require('../assert');

suite('@import');

test('import with string', function() {
	assert.compileTo({imports: {
		'base.roo': [
			'body {',
			'	margin: 0;',
			'}',
		]
	}}, [
		'@import "base";',
	], [
		'body {',
		'	margin: 0;',
		'}',
	]);
});

test('import with url()', function() {
	assert.compileTo([
		'@import url(base);',
	], [
		'@import url(base);',
	]);
});

test('import with url starting with protocol', function() {
	assert.compileTo([
		'@import "http://example.com/style";',
	], [
		'@import "http://example.com/style";',
	]);
});

test('import with media query', function() {
	assert.compileTo([
		'@import "base" screen;',
	], [
		'@import "base" screen;',
	]);
});

test('nest under ruleset', function() {
	assert.compileTo({imports: {
		'base.roo': [
			'body {',
			'	margin: 0;',
			'}',
		]
	}}, [
		'html {',
		'	@import "base";',
		'}',
	], [
		'html body {',
		'	margin: 0;',
		'}',
	]);
});

test('recursively import', function() {
	assert.compileTo({imports: {
		'reset.roo': [
			'body {',
			'	margin: 0;',
			'}',
		],
		'button.roo': [
			'@import "reset";',
			'',
			'.button {',
			'	display: inline-block;',
			'}',
		]
	}}, [
		'@import "button";',
	], [
		'body {',
		'	margin: 0;',
		'}',
		'',
		'.button {',
		'	display: inline-block;',
		'}',
	]);
});

test('import same file multiple times', function() {
	assert.compileTo({imports: {
		'reset.roo': [
			'body {',
			'	margin: 0;',
			'}',
		],
		'button.roo': [
			'@import "reset";',
			'',
			'.button {',
			'	display: inline-block;',
			'}',
		],
		'tabs.roo': [
			'@import "reset";',
			'',
			'.tabs {',
			'	overflow: hidden;',
			'}',
		]
	}}, [
		'@import "button";',
		'@import "tabs";',
	], [
		'body {',
		'	margin: 0;',
		'}',
		'',
		'.button {',
		'	display: inline-block;',
		'}',
		'',
		'.tabs {',
		'	overflow: hidden;',
		'}',
	]);
});

test('recursively import files of the same directory', function() {
	assert.compileTo({imports: {
		'tabs/tab.roo': [
			'.tab {',
			'	float: left;',
			'}',
		],
		'tabs/index.roo': [
			'@import "tab";',
			'',
			'.tabs {',
			'	overflow: hidden;',
			'}',
		]
	}}, [
		'@import "tabs/index";',
	], [
		'.tab {',
		'	float: left;',
		'}',
		'',
		'.tabs {',
		'	overflow: hidden;',
		'}',
	]);
});

test('recursively import files of different directories', function() {
	assert.compileTo({imports: {
		'reset.roo': [
			'body {',
			'	margin: 0;',
			'}',
		],
		'tabs/index.roo': [
			'@import "../reset";',
			'',
			'.tabs {',
			'	overflow: hidden;',
			'}',
		]
	}}, [
		'@import "tabs/index";',
	], [
		'body {',
		'	margin: 0;',
		'}',
		'',
		'.tabs {',
		'	overflow: hidden;',
		'}',
	]);
});

test('import empty file', function() {
	assert.compileTo({imports: {
		'var.roo': [
			'$width = 980px;',
		]
	}}, [
		'@import "var";',
		'',
		'body {',
		'	width: $width;',
		'}',
	], [
		'body {',
		'	width: 980px;',
		'}',
	]);
});

test('not importing file with variables in the path', function() {
	assert.compileTo([
		'$path = "tabs";',
		'@import $path;',
	], [
		'@import "tabs";',
	]);
});

test('not allow importing file has syntax error', function() {
	assert.failAt({imports: {
		'base.roo': [
			'body # {',
			'	margin: 0;',
			'}',
		]
	}}, [
		'@import "base";',
	], {line: 1, column: 7, fileName: 'base.roo'});
});