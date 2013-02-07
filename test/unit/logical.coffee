assert = require '../assert'

suite 'logical'

test 'true and false', ->
	assert.compileTo '''
		body
			-foo: true and false
	''', '''
		body {
			-foo: false;
		}
	'''

test 'true and true', ->
	assert.compileTo '''
		body
			-foo: true and true
	''', '''
		body {
			-foo: true;
		}
	'''

test 'false and true', ->
	assert.compileTo '''
		body
			-foo: false and true
	''', '''
		body {
			-foo: false;
		}
	'''

test 'false and false', ->
	assert.compileTo '''
		body
			-foo: false and false
	''', '''
		body {
			-foo: false;
		}
	'''

test 'true or false', ->
	assert.compileTo '''
		body
			-foo: true or false
	''', '''
		body {
			-foo: true;
		}
	'''

test 'true or true', ->
	assert.compileTo '''
		body
			-foo: true or true
	''', '''
		body {
			-foo: true;
		}
	'''

test 'false or true', ->
	assert.compileTo '''
		body
			-foo: false or true
	''', '''
		body {
			-foo: true;
		}
	'''

test 'false or false', ->
	assert.compileTo '''
		body
			-foo: false or false
	''', '''
		body {
			-foo: false;
		}
	'''

test 'true and false or true', ->
	assert.compileTo '''
		body
			-foo: true and false or true
	''', '''
		body {
			-foo: true;
		}
	'''