assert = require '../assert'

suite 'assignment'

test 'variables are case-sensitive', ->
	assert.compileTo '''
		$width = 960px;
		$Width = 480px;
		body {
			width: $width;
		}
	''', '''
		body {
			width: 960px;
		}
	'''

test '?= after =', ->
	assert.compileTo '''
		$width = 960px;
		$width ?= 480px;
		body {
			width: $width;
		}
	''', '''
		body {
			width: 960px;
		}
	'''

test 'lone ?= ', ->
	assert.compileTo '''
		$width ?= 480px;
		body {
			width: $width;
		}
	''', '''
		body {
			width: 480px;
		}
	'''

test 'not allow assign to item in null', ->
	assert.failAt '''
		$list = null;
		$list[0] = a;
	''', {line: 2, column: 1}

test 'not allow assign to item in list using null', ->
	assert.failAt '''
		$list = 0 1 2;
		$list[null] = a;
	''', {line: 2, column: 7}

test 'assign to item in list using number', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[2] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 1 a;
		}
	'''

test 'assign to edge item in list using number', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[3] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 1 2 a;
		}
	'''

test 'assign to out fo range item in list using number', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[4] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 1 2 null a;
		}
	'''

test 'assign to item in list using negative number', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[-3] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a 1 2;
		}
	'''

test 'assign to edge item in list using negative number', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[-4] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a 0 1 2;
		}
	'''

test 'assign to out-of-range in list using negative number', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[-5] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a null 0 1 2;
		}
	'''

test 'assign to items in list using range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[1..2] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 a;
		}
	'''

test 'assign to partially out-of-range items in list using range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[1..3] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 a;
		}
	'''

test 'assign to edge items in list using range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[3..4] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 1 2 a;
		}
	'''

test 'assign to out-of-range items in list using range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[4..5] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 1 2 null a;
		}
	'''

test 'assign to items in list using negative range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[-3..-2] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a 2;
		}
	'''

test 'assign to partially out-of-range items in list using range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[-4..-2] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a 2;
		}
	'''

test 'assign to edge items in list using negative range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[-5..-4] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a 0 1 2;
		}
	'''

test 'assign to out-of-range items in list using negative range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[-6..-5] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a null 0 1 2;
		}
	'''

test 'assign to item in list using empty exclusive range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[2...2] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 1 a 2;
		}
	'''

test 'assign to edge item in list using empty exclusive range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[3...3] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 1 2 a;
		}
	'''

test 'assign to out-of-range item in list using empty exclusive range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[4...4] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 1 2 null a;
		}
	'''

test 'assign to item in list using empty exclusive negative range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[-3...-3] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a 0 1 2;
		}
	'''

test 'assign to edge item in list using empty exclusive negative range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[-4...-4] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a null 0 1 2;
		}
	'''

test 'assign to out-of-range item in list using empty exclusive negative range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[-5...-5] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a null null 0 1 2;
		}
	'''

test 'assign to items in list using reversed range', ->
	assert.compileTo '''
		$list = 0 1 2;
		$list[1..0] = a b;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: b a 2;
		}
	'''

test 'assign to item in single-item list using number', ->
	assert.compileTo '''
		$list = 0;
		$list[0] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a;
		}
	'''

test 'assign to edge item in single-item list using number', ->
	assert.compileTo '''
		$list = 0;
		$list[1] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 a;
		}
	'''

test 'assign to out fo range item in single-item list using number', ->
	assert.compileTo '''
		$list = 0;
		$list[2] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 null a;
		}
	'''

test 'assign to item in single-item list using negative number', ->
	assert.compileTo '''
		$list = 0;
		$list[-1] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a;
		}
	'''

test 'assign to edge item in single-item list using negative number', ->
	assert.compileTo '''
		$list = 0;
		$list[-2] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a 0;
		}
	'''

test 'assign to out-of-range item in single-item list using negative number', ->
	assert.compileTo '''
		$list = 0;
		$list[-3] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a null 0;
		}
	'''

test 'assign to item in single-item list using range', ->
	assert.compileTo '''
		$list = 0;
		$list[0..1] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a;
		}
	'''

test 'assign to edge item in single-item list using range', ->
	assert.compileTo '''
		$list = 0;
		$list[1..2] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 a;
		}
	'''

test 'assign to edge item in single-item list using range with list', ->
	assert.compileTo '''
		$list = 0;
		$list[1..2] = a, b;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0, a, b;
		}
	'''


test 'assign to out-of-range item in single-item list using range', ->
	assert.compileTo '''
		$list = 0;
		$list[2..3] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 null a;
		}
	'''

test 'assign to item in single-item list using negative range', ->
	assert.compileTo '''
		$list = 0;
		$list[-2..-1] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a;
		}
	'''

test 'assign to edge item in single-item list using negative range', ->
	assert.compileTo '''
		$list = 0;
		$list[-3..-2] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a 0;
		}
	'''

test 'assign to edge item in single-item list using negative range with list', ->
	assert.compileTo '''
		$list = 0;
		$list[-3..-2] = a, b;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a, b, 0;
		}
	'''

test 'assign to out-of-range item in single-item list using negative range', ->
	assert.compileTo '''
		$list = 0;
		$list[-4..-3] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a null 0;
		}
	'''

test 'assign to item in single-item list using empty exclusive range', ->
	assert.compileTo '''
		$list = 0;
		$list[0...0] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a 0;
		}
	'''

test 'assign to edge item in single-item list using empty exclusive range', ->
	assert.compileTo '''
		$list = 0;
		$list[1...1] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 a;
		}
	'''

test 'assign to edge item in single-item list using empty exclusive range with list', ->
	assert.compileTo '''
		$list = 0;
		$list[1...1] = a, b;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0, a, b;
		}
	'''

test 'assign to out-of-range item in single-item list using empty exclusive range', ->
	assert.compileTo '''
		$list = 0;
		$list[2...2] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: 0 null a;
		}
	'''

test 'assign to item in single-item list using empty exclusive negative range', ->
	assert.compileTo '''
		$list = 0;
		$list[-1...-1] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a 0;
		}
	'''

test 'assign to edge item in single-item list using empty exclusive negative range', ->
	assert.compileTo '''
		$list = 0;
		$list[-2...-2] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a null 0;
		}
	'''

test 'assign to edge item in single-item list using empty exclusive negative range with list', ->
	assert.compileTo '''
		$list = 0;
		$list[-2...-2] = a, b;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a, b, null, 0;
		}
	'''

test 'assign to out-of-range item in single-item list using empty exclusive negative range', ->
	assert.compileTo '''
		$list = 0;
		$list[-3...-3] = a;
		body {
			-foo: $list;
		}
	''', '''
		body {
			-foo: a null null 0;
		}
	'''