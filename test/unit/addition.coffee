assert = require '../assert'

suite 'addition'

test 'number + number', ->
	assert.compileTo '''
		body
			-foo: 1 + 1
	''', '''
		body {
			-foo: 2;
		}
	'''

test 'number + percentage', ->
	assert.compileTo '''
		body
			-foo: 1 + 1%
	''', '''
		body {
			-foo: 2%;
		}
	'''

test 'number + dimension', ->
	assert.compileTo '''
		body
			-foo: 1 + 1px
	''', '''
		body {
			-foo: 2px;
		}
	'''

test 'number + identifier', ->
	assert.compileTo '''
		body
			-foo: 1 + id
	''', '''
		body {
			-foo: 1id;
		}
	'''

test 'number + mixin, not allowed', ->
	assert.failAt '''
		$mixin = @mixin
			body
				margin: 0
		body
			-foo: 1 + $mixin
	''', 5, 8

test 'number + string', ->
	assert.compileTo '''
		body
			-foo: 1 + 'str'
	''', '''
		body {
			-foo: '1str';
		}
	'''

test 'percentage + number', ->
	assert.compileTo '''
		body
			-foo: 1% + 1
	''', '''
		body {
			-foo: 2%;
		}
	'''

test 'percentage + percentage', ->
	assert.compileTo '''
		body
			-foo: 1% + 1%
	''', '''
		body {
			-foo: 2%;
		}
	'''

test 'percentage + dimension', ->
	assert.compileTo '''
		body
			-foo: 2% + 1px
	''', '''
		body {
			-foo: 3%;
		}
	'''

test 'percentage + string', ->
	assert.compileTo '''
		body
			-foo: 2% + 'str'
	''', '''
		body {
			-foo: '2%str';
		}
	'''

test 'dimension + number', ->
	assert.compileTo '''
		body
			-foo: 1px + 1
	''', '''
		body {
			-foo: 2px;
		}
	'''

test 'dimension + dimension', ->
	assert.compileTo '''
		body
			-foo: 1px + 1px
	''', '''
		body {
			-foo: 2px;
		}
	'''

test 'dimension + dimension, different units', ->
	assert.compileTo '''
		body
			-foo: 1em + 1px
	''', '''
		body {
			-foo: 2em;
		}
	'''

test 'dimension + identifier', ->
	assert.compileTo '''
		body
			-foo: 1px + id
	''', '''
		body {
			-foo: 1pxid;
		}
	'''

test 'dimension + string', ->
	assert.compileTo '''
		body
			-foo: 1px + 'str'
	''', '''
		body {
			-foo: '1pxstr';
		}
	'''

test 'boolean + identifier', ->
	assert.compileTo '''
		body
			-foo: true + id
	''', '''
		body {
			-foo: trueid;
		}
	'''

test 'boolean + string', ->
	assert.compileTo '''
		body
			-foo: true + 'str'
	''', '''
		body {
			-foo: 'truestr';
		}
	'''

test 'identifier + number', ->
	assert.compileTo '''
		body
			-foo: id + 1
	''', '''
		body {
			-foo: id1;
		}
	'''

test 'identifier + identifier', ->
	assert.compileTo '''
		body
			-foo: -webkit + -moz
	''', '''
		body {
			-foo: -webkit-moz;
		}
	'''

test 'identifier + dimension', ->
	assert.compileTo '''
		body
			-foo: id + 1px
	''', '''
		body {
			-foo: id1px;
		}
	'''

test 'identifier + boolean', ->
	assert.compileTo '''
		body
			-foo: id + true
	''', '''
		body {
			-foo: idtrue;
		}
	'''

test 'identifier + str', ->
	assert.compileTo '''
		body
			-foo: id + 'str'
	''', '''
		body {
			-foo: 'idstr';
		}
	'''

test 'string + number', ->
	assert.compileTo '''
		body
			-foo: 'str' + 1
	''', '''
		body {
			-foo: 'str1';
		}
	'''

test 'string + percentage', ->
	assert.compileTo '''
		body
			-foo: 'str' + 1%
	''', '''
		body {
			-foo: 'str1%';
		}
	'''

test 'string + dimension', ->
	assert.compileTo '''
		body
			-foo: 'str' + 1px
	''', '''
		body {
			-foo: 'str1px';
		}
	'''

test 'string + boolean', ->
	assert.compileTo '''
		body
			-foo: 'str' + false
	''', '''
		body {
			-foo: 'strfalse';
		}
	'''

test 'string + identifier', ->
	assert.compileTo '''
		body
			-foo: 'str' + id
	''', '''
		body {
			-foo: 'strid';
		}
	'''

test 'string + string', ->
	assert.compileTo '''
		body
			-foo: 'foo' + 'bar'
	''', '''
		body {
			-foo: 'foobar';
		}
	'''

test 'string + string, different quotes', ->
	assert.compileTo '''
		body
			-foo: "foo" + 'bar'
	''', '''
		body {
			-foo: "foobar";
		}
	'''

test 'number+number', ->
	assert.compileTo '''
		body
			-foo: 1+1
	''', '''
		body {
			-foo: 2;
		}
	'''

test 'number+ number', ->
	assert.compileTo '''
		body
			-foo: 1+ 1
	''', '''
		body {
			-foo: 2;
		}
	'''