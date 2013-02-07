assert = require '../assert'

suite 'string'

test 'single-quoted string with escaped quote', ->
	assert.compileTo '''
		a
			content: '"a\\''
	''', '''
		a {
			content: '"a\\'';
		}
	'''

test 'empty single-quoted string', ->
	assert.compileTo '''
		a
			content: ''
	''', '''
		a {
			content: '';
		}
	'''

test 'not interpolating single-quoted string', ->
	assert.compileTo '''
		a
			content: 'a $var'
	''', '''
		a {
			content: 'a $var';
		}
	'''

test 'double-quoted string with escaped quote', ->
	assert.compileTo '''
		a
			content: "'a0\\""
	''', '''
		a {
			content: "'a0\\"";
		}
	'''

test 'empty double-quoted string', ->
	assert.compileTo '''
		a
			content: ""
	''', '''
		a {
			content: "";
		}
	'''

test 'interpolate identifier', ->
	assert.compileTo '''
		$name = guest
		a
			content: "hello $name"
	''', '''
		a {
			content: "hello guest";
		}
	'''

test 'interpolate single-quoted string', ->
	assert.compileTo '''
		$name = 'guest'
		a
			content: "hello $name"
	''', '''
		a {
			content: "hello guest";
		}
	'''

test 'interpolate double-quoted string', ->
	assert.compileTo '''
		$name = "guest"
		a
			content: "hello $name"
	''', '''
		a {
			content: "hello guest";
		}
	'''

test 'interpolate list', ->
	assert.compileTo '''
		$name = john doe
		a
			content: "hello $name"
	''', '''
		a {
			content: "hello john doe";
		}
	'''

test 'not allow interpolating mixin', ->
	assert.failAt '''
		$name = @mixin
			body
				margin: auto
		a
			content: "hello $name"
	''', 5, 18

test 'contain braced variable', ->
	assert.compileTo '''
		$chapter = 4
		figcaption
			content: "Figure {$chapter}-12"
	''', '''
		figcaption {
			content: "Figure 4-12";
		}
	'''

test 'escape braced variable', ->
	assert.compileTo '''
		figcaption
			content: "Figure \\{\\$chapter}-12"
	''', '''
		figcaption {
			content: "Figure \\{\\$chapter}-12";
		}
	'''

test 'contain braces but not variable', ->
	assert.compileTo '''
		$chapter = 4
		figcaption
			content: "Figure {chapter}-12"
	''', '''
		figcaption {
			content: "Figure {chapter}-12";
		}
	'''

test 'escape double quotes', ->
	assert.compileTo '''
		$str = '"\\""'
		a
			content: "$str"
	''', '''
		a {
			content: "\\"\\"\\"";
		}
	'''