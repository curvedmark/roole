assert = require '../assert'

suite 'mixin'

test 'no params', ->
	assert.compileTo '''
		$mixin = @mixin
			width: auto

		body
			$mixin()
	''', '''
		body {
			width: auto;
		}
	'''

test 'not allow undefined mixin', ->
	assert.failAt '''
		body
			$mixin()
	''', 2, 2

test 'not allow non-mixin to be called', ->
	assert.failAt '''
		$mixin = 0

		body
			$mixin()
	''', 4, 2

test 'call mixin multiple times', ->
	assert.compileTo '''
		$mixin = @mixin
			body
				width: $width

		$width = 980px
		$mixin()

		$width = 500px
		$mixin()
	''', '''
		body {
			width: 980px;
		}

		body {
			width: 500px;
		}
	'''

test 'specify parameter', ->
	assert.compileTo '''
		$mixin = @mixin $width
			body
				width: $width

		$mixin(980px)
	''', '''
		body {
			width: 980px;
		}
	'''

test 'specify default parameter', ->
	assert.compileTo '''
		$mixin = @mixin $width, $height = 100px
			body
				width: $width
				height: $height

		$mixin(980px)
	''', '''
		body {
			width: 980px;
			height: 100px;
		}
	'''

test 'under-specify arguments', ->
	assert.compileTo '''
		$mixin = @mixin $width, $height
			body
				width: $width
				height: $height

		$mixin(980px)
	''', '''
		body {
			width: 980px;
			height: null;
		}
	'''

test 'under-specify arguments for default parameter', ->
	assert.compileTo '''
		$mixin = @mixin $width, $height = 300px
			body
				width: $width
				height: $height

		$mixin()
	''', '''
		body {
			width: null;
			height: 300px;
		}
	'''