assert = require '../assert'

suite 'member'

test 'access list with number', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[2];
		}
	''', '''
		body {
			-foo: 2;
		}
	'''


test 'access list with number, out of range', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[3];
		}
	''', '''
		body {
			-foo: null;
		}
	'''

test 'access value with number', ->
	assert.compileTo '''
		body {
			-foo: 1[0];
		}
	''', '''
		body {
			-foo: 1;
		}
	'''

test 'access value with number, out of range', ->
	assert.compileTo '''
		body {
			-foo: 1[1];
		}
	''', '''
		body {
			-foo: null;
		}
	'''

test 'access list with negative number', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[-3];
		}
	''', '''
		body {
			-foo: 0;
		}
	'''

test 'access list with negative number, out of range', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[-4];
		}
	''', '''
		body {
			-foo: null;
		}
	'''

test 'access value with negative number', ->
	assert.compileTo '''
		body {
			-foo: 1[-1];
		}
	''', '''
		body {
			-foo: 1;
		}
	'''

test 'access value with negative number, out of range', ->
	assert.compileTo '''
		body {
			-foo: 1[-2];
		}
	''', '''
		body {
			-foo: null;
		}
	'''

test 'access list with range', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[1..2];
		}
	''', '''
		body {
			-foo: 1 2;
		}
	'''

test 'access list with oversized range', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[1..3];
		}
	''', '''
		body {
			-foo: 1 2;
		}
	'''

test 'access list with one number range', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[1..1];
		}
	''', '''
		body {
			-foo: 1;
		}
	'''

test 'access list with empty range', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[1...1];
		}
	''', '''
		body {
			-foo: null;
		}
	'''

test 'access list with range, out of range', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[3..4];
		}
	''', '''
		body {
			-foo: null;
		}
	'''

test 'access list with reversed range', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[2..1];
		}
	''', '''
		body {
			-foo: 2 1;
		}
	'''

test 'access list with oversized reversed range', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[3..1];
		}
	''', '''
		body {
			-foo: 2 1;
		}
	'''

test 'access list with reversed range, out of range', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[4..3];
		}
	''', '''
		body {
			-foo: null;
		}
	'''

test 'access list with range, from negative to negative', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[-2..-1];
		}
	''', '''
		body {
			-foo: 1 2;
		}
	'''

test 'access list with range, from negative to positive', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[-2..2];
		}
	''', '''
		body {
			-foo: 1 2;
		}
	'''

test 'access list with range, from positive to negative', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[1..-1];
		}
	''', '''
		body {
			-foo: 1 2;
		}
	'''

test 'access list with reversed range, from negative to negative', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[-1..-2];
		}
	''', '''
		body {
			-foo: 2 1;
		}
	'''

test 'access list with reversed range, from negative to positive', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[-1..1];
		}
	''', '''
		body {
			-foo: 2 1;
		}
	'''

test 'access list with reversed range, from positive to negative', ->
	assert.compileTo '''
		body {
			-foo: (0 1 2)[2..-2];
		}
	''', '''
		body {
			-foo: 2 1;
		}
	'''

test 'not allow access list with invalid type', ->
	assert.failAt '''
		body {
			-foo: (0 1 2)[true];
		}
	''', {line: 2, column: 16}

test 'not allow access null', ->
	assert.failAt '''
		body {
			-foo: null[0];
		}
	''', {line: 2, column: 8}