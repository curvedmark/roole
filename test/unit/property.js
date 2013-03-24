'use strict';

var assert = require('../assert');

suite('property');

test('starred property', function() {
	assert.compileTo([
		'body {',
		'	*zoom: 1;',
		'}',
	], [
		'body {',
		'	*zoom: 1;',
		'}',
	]);
});

test('!important', function() {
	assert.compileTo([
		'body {',
		'	width: auto !important;',
		'}',
	], [
		'body {',
		'	width: auto !important;',
		'}',
	]);
});

test('without trailing semicolon', function() {
	assert.compileTo([
		'body {',
		'	margin: 0',
		'}',
	], [
		'body {',
		'	margin: 0;',
		'}',
	]);
});

test('with multiple trailing semicolons', function() {
	assert.compileTo([
		'body {',
		'	margin: 0;;',
		'}',
	], [
		'body {',
		'	margin: 0;',
		'}',
	]);
});

test('with multiple trailing ; interspersed with spaces', function() {
	assert.compileTo([
		'body {',
		'	margin: 0; ;',
		'}',
	], [
		'body {',
		'	margin: 0;',
		'}',
	]);
});

test('with trailing ; and !important', function() {
	assert.compileTo([
		'body {',
		'	margin: 0 !important;',
		'}',
	], [
		'body {',
		'	margin: 0 !important;',
		'}',
	]);
});