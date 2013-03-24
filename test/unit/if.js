'use strict';

var assert = require('../assert');

suite('@if');

test('true condition', function() {
	assert.compileTo([
		'@if true {',
		'	body {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'body {',
		'	width: auto;',
		'}',
	]);
});

test('list as true condition', function() {
	assert.compileTo([
		'@if "", "" {',
		'	body {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'body {',
		'	width: auto;',
		'}',
	]);
});

test('false condition', function() {
	assert.compileTo([
		'@if false {',
		'	body {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'',
		]);
});

test('0 as false condition', function() {
	assert.compileTo([
		'@if 0 {',
		'	body {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'',
	]);
});

test('0% as false condition', function() {
	assert.compileTo([
		'@if 0% {',
		'	body {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'',
	]);
});

test('0px as false condition', function() {
	assert.compileTo([
		'@if 0px {',
		'	body {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'',
	]);
});

test('empty string as false condition', function() {
	assert.compileTo([
		'@if "" {',
		'	body {',
		'		width: auto;',
		'	}',
		'}',
	], [
		'',
	]);
});

test('@else if', function() {
	assert.compileTo([
		'body {',
		'	@if false {',
		'		width: auto;',
		'	} @else if true {',
		'		height: auto;',
		'	}',
		'}',
	], [
		'body {',
		'	height: auto;',
		'}',
	]);
});

test('short-ciruit @else if', function() {
	assert.compileTo([
		'body {',
		'	@if false {',
		'		width: auto;',
		'	} @else if false {',
		'		height: auto;',
		'	} @else if true {',
		'		margin: auto;',
		'	} @else if true {',
		'		padding: auto;',
		'	}',
		'}',
	], [
		'body {',
		'	margin: auto;',
		'}',
	]);
});

test('@else', function() {
	assert.compileTo([
		'body {',
		'	@if false {',
		'		width: auto;',
		'	} @else {',
		'		height: auto;',
		'	}',
		'}',
	], [
		'body {',
		'	height: auto;',
		'}',
	]);
});

test('@else with @else if', function() {
	assert.compileTo([
		'body {',
		'	@if false {',
		'		width: auto;',
		'	} @else if false {',
		'		height: auto;',
		'	} @else {',
		'		margin: auto;',
		'	}',
		'}',
	], [
		'body {',
		'	margin: auto;',
		'}',
	]);
});