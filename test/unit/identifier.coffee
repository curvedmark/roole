assert = require '../assert'

suite 'identifier'

test 'starting with a dash', ->
	assert.compileTo '''
		body
			-webkit-box-sizing: border-box
	''', '''
		body {
			-webkit-box-sizing: border-box;
		}
	'''

test 'not allow starting with double-dash', ->
	assert.failAt '''
		body
			--webkit-box-sizing: border-box
	''', 2, 3

test 'interpolate identifier', ->
	assert.compileTo '''
		$name = star
		.icon-$name
			float: left
	''', '''
		.icon-star {
			float: left;
		}
	'''

test 'interpolate number', ->
	assert.compileTo '''
		$num = 12
		.icon-$num
			float: left
	''', '''
		.icon-12 {
			float: left;
		}
	'''

test 'interpolate string', ->
	assert.compileTo '''
		$name = 'star'
		.icon-$name
			float: left
	''', '''
		.icon-star {
			float: left;
		}
	'''

test 'interpolate list', ->
	assert.compileTo '''
		$name = star span
		.icon-$name
			float: left
	''', '''
		.icon-star span {
			float: left;
		}
	'''

test 'not allow interpolating mixin', ->
	assert.failAt '''
		$name = @mixin
			body
				margin: auto
		.icon-$name
			float: left
	''', 4, 7

test 'interpolate multiple variables', ->
	assert.compileTo '''
		$size = big
		$name = star
		.icon-$size$name
			float: left
	''', '''
		.icon-bigstar {
			float: left;
		}
	'''

test 'interpolation consists only two variables', ->
	assert.compileTo '''
		$prop = border
		$pos = -left
		body
			$prop$pos: solid
	''', '''
		body {
			border-left: solid;
		}
	'''

test 'braced interpolation', ->
	assert.compileTo '''
		$prop = border
		body
			{$prop}: solid
	''', '''
		body {
			border: solid;
		}
	'''

test 'contain dangling dash', ->
	assert.compileTo '''
		$prop = border
		$pos = left
		body
			{$prop}-$pos: solid
	''', '''
		body {
			border-left: solid;
		}
	'''

test 'start with dangling dash', ->
	assert.compileTo '''
		$prefix = moz
		$prop = box-sizing
		body
			-{$prefix}-$prop: border-box
	''', '''
		body {
			-moz-box-sizing: border-box;
		}
	'''