'use strict';

var assert = require('../assert');

suite('indent');

test('empty input', function() {
	assert.compileTo('', '');
});

test('pure spaces input', function() {
	assert.compileTo('  ', '');
});

test('under-indent', function() {
	assert.compileTo([
		'body',
		'		width: auto',
		'	height: auto',
	], [
		'body {',
		'	width: auto;',
		'	height: auto;',
		'}',
	]);
});

test('over-indent', function() {
	assert.compileTo([
		'body',
		'	width: auto',
		'	div',
		'			height: auto',
	], [
		'body {',
		'	width: auto;',
		'}',
		'	body div {',
		'		height: auto;',
		'	}',
	]);
});

test('start with indent', function() {
	assert.compileTo([
		'\tbody',
		'\t\twidth: auto',
		'\t\theight: auto',
	], [
		'body {',
		'	width: auto;',
		'	height: auto;',
		'}',
	]);
});

test('start with indent, end with outdent', function() {
	assert.compileTo([
		'\t@import url(example.com)',
		'\t',
	], [
		'@import url(example.com);',
	]);
});