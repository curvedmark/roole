'use strict';

var assert = require('../assert');

suite('addition');

test('number + number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 + 1;',
		'}',
	], [
		'body {',
		'	-foo: 2;',
		'}',
	]);
});

test('number + percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 + 1%;',
		'}',
	], [
		'body {',
		'	-foo: 2%;',
		'}',
	]);
});

test('number + dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 + 1px;',
		'}',
	], [
		'body {',
		'	-foo: 2px;',
		'}',
	]);
});

test('number + function, not allowed', function() {
	assert.failAt([
		'$function = @function {',
		'	body {',
		'		margin: 0;',
		'	}',
		'};',
		'body {',
		'	-foo: 1 + $function;',
		'}',
	], {line: 7, column: 8});
});

test('number + string', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1 + "str";',
		'}',
	], [
		'body {',
		'	-foo: "1str";',
		'}',
	]);
});

test('percentage + number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1% + 1;',
		'}',
	], [
		'body {',
		'	-foo: 2%;',
		'}',
	]);
});

test('percentage + percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1% + 1%;',
		'}',
	], [
		'body {',
		'	-foo: 2%;',
		'}',
	]);
});

test('percentage + dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 2% + 1px;',
		'}',
	], [
		'body {',
		'	-foo: 3%;',
		'}',
	]);
});

test('percentage + string', function() {
	assert.compileTo([
		'body {',
		'	-foo: 2% + "str";',
		'}',
	], [
		'body {',
		'	-foo: "2%str";',
		'}',
	]);
});

test('dimension + number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1px + 1;',
		'}',
	], [
		'body {',
		'	-foo: 2px;',
		'}',
	]);
});

test('dimension + dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1px + 1px;',
		'}',
	], [
		'body {',
		'	-foo: 2px;',
		'}',
	]);
});

test('dimension + dimension, different units', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1em + 1px;',
		'}',
	], [
		'body {',
		'	-foo: 2em;',
		'}',
	]);
});

test('dimension + identifier', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1px + id;',
		'}',
	], [
		'body {',
		'	-foo: 1pxid;',
		'}',
	]);
});

test('dimension + string', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1px + "str";',
		'}',
	], [
		'body {',
		'	-foo: "1pxstr";',
		'}',
	]);
});

test('boolean + identifier', function() {
	assert.compileTo([
		'body {',
		'	-foo: true + id;',
		'}',
	], [
		'body {',
		'	-foo: trueid;',
		'}',
	]);
});

test('boolean + string', function() {
	assert.compileTo([
		'body {',
		'	-foo: true + "str";',
		'}',
	], [
		'body {',
		'	-foo: "truestr";',
		'}',
	]);
});

test('identifier + number', function() {
	assert.compileTo([
		'body {',
		'	-foo: id + 1;',
		'}',
	], [
		'body {',
		'	-foo: id1;',
		'}',
	]);
});

test('identifier + identifier', function() {
	assert.compileTo([
		'body {',
		'	-foo: -webkit + -moz;',
		'}',
	], [
		'body {',
		'	-foo: -webkit-moz;',
		'}',
	]);
});

test('identifier + dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: id + 1px;',
		'}',
	], [
		'body {',
		'	-foo: id1px;',
		'}',
	]);
});

test('identifier + boolean', function() {
	assert.compileTo([
		'body {',
		'	-foo: id + true;',
		'}',
	], [
		'body {',
		'	-foo: idtrue;',
		'}',
	]);
});

test('identifier + str', function() {
	assert.compileTo([
		'body {',
		'	-foo: id + "str";',
		'}',
	], [
		'body {',
		'	-foo: "idstr";',
		'}',
	]);
});

test('string + number', function() {
	assert.compileTo([
		'body {',
		'	-foo: "str" + 1;',
		'}',
	], [
		'body {',
		'	-foo: "str1";',
		'}',
	]);
});

test('string + percentage', function() {
	assert.compileTo([
		'body {',
		'	-foo: "str" + 1%;',
		'}',
	], [
		'body {',
		'	-foo: "str1%";',
		'}',
	]);
});

test('string + dimension', function() {
	assert.compileTo([
		'body {',
		'	-foo: "str" + 1px;',
		'}',
	], [
		'body {',
		'	-foo: "str1px";',
		'}',
	]);
});

test('string + boolean', function() {
	assert.compileTo([
		'body {',
		'	-foo: "str" + false;',
		'}',
	], [
		'body {',
		'	-foo: "strfalse";',
		'}',
	]);
});

test('string + identifier', function() {
	assert.compileTo([
		'body {',
		'	-foo: "str" + id;',
		'}',
	], [
		'body {',
		'	-foo: "strid";',
		'}',
	]);
});

test('string + string', function() {
	assert.compileTo([
		'body {',
		'	-foo: "foo" + "bar";',
		'}',
	], [
		'body {',
		'	-foo: "foobar";',
		'}',
	]);
});

test('string + string, different quotes', function() {
	assert.compileTo([
		'body {',
		'	-foo: "foo" + \'bar\';',
		'}',
	], [
		'body {',
		'	-foo: "foobar";',
		'}',
	]);
});

test('number+number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1+1;',
		'}',
	], [
		'body {',
		'	-foo: 2;',
		'}',
	]);
});

test('number+ number', function() {
	assert.compileTo([
		'body {',
		'	-foo: 1+ 1;',
		'}',
	], [
		'body {',
		'	-foo: 2;',
		'}',
	]);
});