'use strict';

var assert = require('../assert');

suite('ruleset');

test('remove empty ruleset', function() {
	assert.compileTo([
		'body {}',
	], [
		'',
	]);
});