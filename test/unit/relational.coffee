assert = require '../assert'

suite 'relational'

test 'number < number', ->
	assert.compileTo '''
		body
			-foo: 1 < 2
	''', '''
		body {
			-foo: true;
		}
	'''

test 'number <= number', ->
	assert.compileTo '''
		body
			-foo: 2 <= 2
	''', '''
		body {
			-foo: true;
		}
	'''

test 'number > number', ->
	assert.compileTo '''
		body
			-foo: 2 > 2
	''', '''
		body {
			-foo: false;
		}
	'''

test 'number >= number', ->
	assert.compileTo '''
		body
			-foo: 2 >= 3
	''', '''
		body {
			-foo: false;
		}
	'''

test 'number >= identifer', ->
	assert.compileTo '''
		body
			-foo: 2 >= abc
	''', '''
		body {
			-foo: false;
		}
	'''

test 'identifer < number', ->
	assert.compileTo '''
		body
			-foo: abc < 2
	''', '''
		body {
			-foo: false;
		}
	'''

test 'identifier < identifier', ->
	assert.compileTo '''
		body
			-foo: a < b
	''', '''
		body {
			-foo: true;
		}
	'''

test 'string > string', ->
	assert.compileTo '''
		body
			-foo: 'b' > 'a'
	''', '''
		body {
			-foo: true;
		}
	'''