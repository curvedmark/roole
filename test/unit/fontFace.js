'use strict';

var assert = require('../assert');

suite('@font-face');

test('remove empty @font-face', function() {
	assert.compileTo([
		'@font-face {}',
	], [
		'',
	]);
});

test('@font-face', function() {
	assert.compileTo([
		'@font-face {',
		'	font-family: font;',
		'}',
	], [
		'@font-face {',
		'	font-family: font;',
		'}',
	]);
});