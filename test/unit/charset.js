'use strict';

var assert = require('../assert');

suite('@charset');

test('@charset', function() {
	assert.compileTo([
		'@charset "UTF-8";',
	], [
		'@charset "UTF-8";',
	]);
});