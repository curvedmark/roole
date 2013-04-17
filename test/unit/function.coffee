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
	''', {line: 2, column: 9}

test 'not allow non-function to be called', ->
	assert.failAt '''
		$width = 960px;

		body {
			width: $width();
		}
	''', {line: 4, column: 9}

test 'not allow using @return outside @function', ->
	assert.failAt '''
		body {
			@return 1;
		}
	''', {line: 2, column: 2}

test 'call function multiple times', ->
	assert.compileTo '''
		body {
			$value = 960px;
			$get-value = @function {
			  @return $value;
			};

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
		$add = @function ...$numbers {
			$sum = 0;
			@for $number in $numbers {
				$sum = $sum + $number;
			}
			@return $sum;
		};

		body {
			width: $add(1, 2, 3, 4);
		}
	''', '''
		body {
			width: 10;
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

test '$arguments', ->
	assert.compileTo '''
		$arguments = @function {
			@return $arguments;
		};

		body {
			-foo: $arguments(foo, bar)
		}
	''', '''
		body {
			-foo: foo, bar;
		}
	'''

test 'do not modify arguments by direct assignment', ->
	assert.compileTo '''
		$modify = @function $param {
			$param = 1;
			@return $param;
		};

		body {
			$arg = 0;
			-foo: $modify($arg) $arg;
		}
	''', '''
		body {
			-foo: 1 0;
		}
	'''

test 'function called within a mixin', ->
	assert.compileTo '''
		$bar = @function {
			@return 80px;
		};

		$foo = @function {
		  width: $bar();
		};

		body {
			@mixin $foo();
		}
	''', '''
		body {
			width: 80px;
		}
	'''

test 'lexical scope', ->
	assert.compileTo '''
		$var = 1;
		$func = @function {
		  @return $var;
		};

		body {
		  $var = 2;
		  -foo: $func();
		}
	''', '''
		body {
			-foo: 1;
		}
	'''
