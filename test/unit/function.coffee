assert = require '../assert'

suite 'function'

test 'no params', ->
	assert.compileTo '''
		$width = @function {
			@return 960px;
		};

		body {
			width: $width();
		}
	''', '''
		body {
			width: 960px;
		}
	'''

test 'not allow undefined function', ->
	assert.failAt '''
		body {
			width: $width();
		}
	''', 2, 9

test 'not allow non-function to be called', ->
	assert.failAt '''
		$width = 960px;

		body {
			width: $width();
		}
	''', 4, 9

test 'call function multiple times', ->
	assert.compileTo '''
		$get-value = @function {
			@return $value;
		};

		body {
			$value = 960px;
			width: $get-value();

			$value = 400px;
			height: $get-value();
		}

	''', '''
		body {
			width: 960px;
			height: 400px;
		}
	'''

test 'specify parameter', ->
	assert.compileTo '''
		$width = @function $width {
			@return $width;
		};

		body {
			width: $width(960px);
		}
	''', '''
		body {
			width: 960px;
		}
	'''

test 'specify default parameter', ->
	assert.compileTo '''
		$width = @function $width = 960px {
			@return $width;
		};

		body {
			width: $width();
		}
	''', '''
		body {
			width: 960px;
		}
	'''

test 'specify default parameter, overriden', ->
	assert.compileTo '''
		$width = @function $width = 960px {
			@return $width;
		};

		body {
			width: $width(400px);
		}
	''', '''
		body {
			width: 400px;
		}
	'''

test 'under-specify arguments', ->
	assert.compileTo '''
		$margin = @function $h, $v {
			@return $h $v;
		};

		body {
			margin: $margin(20px);
		}
	''', '''
		body {
			margin: 20px null;
		}
	'''

test 'rest argument', ->
	assert.compileTo '''
		$icons = @function $size, ...$icon-names {
			width: $size;
			@for $icon-name in $icon-names {
				background: url("$icon-name");
			}
		};

		body {
			@mixin $icons(20px, star, heart);
		}
	''', '''
		body {
			width: 20px;
			background: url("star");
			background: url("heart");
		}
	'''

test 'ignore rules under @return', ->
	assert.compileTo '''
		$width = @function {
			$width = 960px;
			@return $width;

			$width = 400px;
			@return $width;
		};

		body {
			width: $width();
		}
	''', '''
		body {
			width: 960px;
		}
	'''

test 'ignore block rules', ->
	assert.compileTo '''
		$width = @function {
			div {
				margin: 0;
			}

			$width = 960px;
			@return $width;
		};

		body {
			width: $width();
		}
	''', '''
		body {
			width: 960px;
		}
	'''

test 'implicit @return', ->
	assert.compileTo '''
		$width = @function {
			div {
				margin: 0;
			}
		};

		body {
			width: $width();
		}
	''', '''
		body {
			width: null;
		}
	'''