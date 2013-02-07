assert = require '../assert'

suite 'range'

test 'natural range', ->
	assert.compileTo '''
		body
			-foo: 1..3
	''', '''
		body {
			-foo: 1 2 3;
		}
	'''

test 'natural exclusive range', ->
	assert.compileTo '''
		body
			-foo: 1...3
	''', '''
		body {
			-foo: 1 2;
		}
	'''

test 'reversed range', ->
	assert.compileTo '''
		body
			-foo: 3..1
	''', '''
		body {
			-foo: 3 2 1;
		}
	'''

test 'reversed exclusive range', ->
	assert.compileTo '''
		body
			-foo: 3...1
	''', '''
		body {
			-foo: 3 2;
		}
	'''

test 'one number range', ->
	assert.compileTo '''
		body
			-foo: 1..1
	''', '''
		body {
			-foo: 1;
		}
	'''

test 'empty range', ->
	assert.compileTo '''
		body
			-foo: 1...1
	''', '''
		body {
			-foo: null;
		}
	'''

test 'percentage range', ->
	assert.compileTo '''
		body
			-foo: 0%..2%
	''', '''
		body {
			-foo: 0% 1% 2%;
		}
	'''

test 'dimension range', ->
	assert.compileTo '''
		body
			-foo: 100px..102px
	''', '''
		body {
			-foo: 100px 101px 102px;
		}
	'''

test 'mixed range', ->
	assert.compileTo '''
		body
			-foo: 1px..3%
	''', '''
		body {
			-foo: 1px 2px 3px;
		}
	'''

test 'start number must be numberic', ->
	assert.failAt '''
		body
			-foo: a...3
	''', 2, 8

test 'end number must be numberic', ->
	assert.failAt '''
		body
			-foo: 1..b
	''', 2, 11