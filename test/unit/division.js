'use strict';

var assert = require('../assert');

suite('division');

test('number / number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 / 2;',
		'}',
	], [
		'body {',
		'	-foo: 0.5;',
		'}',
	]);
});

test('number / 0, not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: 1 / 0;',
		'}',
	], {line: 2, column: 12});
});

test('number / number, result in fraction', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 / 3;',
		'}',
	], [
		'body {',
		'	-foo: 0.333;',
		'}',
	]);
});

test('number / percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: 2 / 1%;',
		'}',
	], [
		'body {',
		'	-foo: 2%;',
		'}',
	]);
});

test('number / 0%, not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: 1 / 0%;',
		'}',
	], {line: 2, column: 12});
});

test('number / dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 / 2px;',
		'}',
	], [
		'body {',
		'	-foo: 0.5px;',
		'}',
	]);
});

test('number / 0px, not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: 1 / 0px;',
		'}',
	], {line: 2, column: 12});
});

test('percentage / number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1% / 2;',
		'}',
	], [
		'body {',
		'	-foo: 0.5%;',
		'}',
	]);
});

test('percentage / 0, not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: 1% / 0;',
		'}',
	], {line: 2, column: 13});
});

test('percentage / percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1% / 1%;',
		'}',
	], [
		'body {',
		'	-foo: 1%;',
		'}',
	]);
});

test('percentage / 0%, not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: 1% / 0%;',
		'}',
	], {line: 2, column: 13});
});

test('percentage / dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1% / 2px;',
		'}',
	], [
		'body {',
		'	-foo: 0.5%;',
		'}',
	]);
});

test('percentage / 0px, not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: 1% / 0px;',
		'}',
	], {line: 2, column: 13});
});

test('dimension / number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1px / 1;',
		'}',
	], [
		'body {',
		'	-foo: 1px;',
		'}',
	]);
});

test('dimension / 0, not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: 1px / 0;',
		'}',
	], {line: 2, column: 14});
});

test('dimension / percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1px / 2%;',
		'}',
	], [
		'body {',
		'	-foo: 0.5px;',
		'}',
	]);
});

test('dimension / 0%, not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: 1px / 0%;',
		'}',
	], {line: 2, column: 14});
});

test('dimension / dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1px / 1px;',
		'}',
	], [
		'body {',
		'	-foo: 1px;',
		'}',
	]);
});

test('dimension / dimension, different units', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1em / 2px;',
		'}',
	], [
		'body {',
		'	-foo: 0.5em;',
		'}',
	]);
});

test('dimension / 0px, not allowed', function() {
	assert.failAt([
		'body {',
		'	-foo: 1px / 0px;',
		'}',
	], {line: 2, column: 14});
});

test('number/ number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1/ 2;',
		'}',
	], [
		'body {',
		'	-foo: 0.5;',
		'}',
	]);
});

test('number /number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 /2;',
		'}',
	], [
		'body {',
		'	-foo: 0.5;',
		'}',
	]);
});