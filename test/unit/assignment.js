'use strict';

var assert = require('../assert');

suite('assignment');

test('variables are case-sensitive', function() {
	assert.compileTo([
		'$width = 960px;',
		'$Width = 480px;',
		'body {',
		'	width: $width;',
		'}',
	], [
		'body {',
		'	width: 960px;',
		'}',
	]);
});

test('?= after =', function() {
	assert.compileTo([
		'$width = 960px;',
		'$width ?= 480px;',
		'body {',
		'	width: $width;',
		'}',
	], [
		'body {',
		'	width: 960px;',
		'}',
	]);
});

test('lone ?= ', function() {
	assert.compileTo([
		'$width ?= 480px;',
		'body {',
		'	width: $width;',
		'}',
	], [
		'body {',
		'	width: 480px;',
		'}',
	]);
});

test('+=', function() {
	assert.compileTo([
		'$width = 480px;',
		'$width += 100px;',
		'body {',
		'	width: $width;',
		'}',
	], [
		'body {',
		'	width: 580px;',
		'}',
	]);
});