'use strict';

var assert = require('../assert');

suite('comment');

test('empty input', function() {
	assert.compileTo([
		'',
	], [
		'',
	]);
});

test('pure spaces input', function() {
	assert.compileTo([
		'  ',
	], [
		'',
	]);
});

test('single-line commnet', function() {
	assert.compileTo([
		'// before selector',
		'body // selctor',
		'{',
		'// after selector',
		'	// before property',
		'	width: auto; // property',
		'	// after property',
		'// outdent',
		'	height: auto; // before eof',
		'}',
	], [
		'body {',
		'	width: auto;',
		'	height: auto;',
		'}',
	]);
});

test('multi-line commnet', function() {
	assert.compileTo([
		'/* license */',
		'',
		'body {',
		'/* after selector */',
		'	margin: 0;',
		'}',
	], [
		'/* license */',
		'',
		'body {',
		'	margin: 0;',
		'}',
	]);
});