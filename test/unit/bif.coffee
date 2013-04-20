assert = require '../assert'

suite 'Built-in Functions'

test '$len(list)', ->
	assert.compileTo '''
		body {
			-foo: $len(a b);
		}
	''', '''
		body {
			-foo: 2;
		}
	'''

test '$len(value)', ->
	assert.compileTo '''
		body {
			-foo: $len(a);
		}
	''', '''
		body {
			-foo: 1;
		}
	'''

test '$len(), not allowed', ->
	assert.failAt '''
		body {
			-foo: $len();
		}
	''', {line: 2, column: 8}

test '$unit(number)', ->
	assert.compileTo '''
		body {
			-foo: $unit(1);
		}
	''', '''
		body {
			-foo: "";
		}
	'''

test '$unit(percentage)', ->
	assert.compileTo '''
		body {
			-foo: $unit(1%);
		}
	''', '''
		body {
			-foo: "%";
		}
	'''

test '$unit(dimension)', ->
	assert.compileTo '''
		body {
			-foo: $unit(1px);
		}
	''', '''
		body {
			-foo: "px";
		}
	'''

test '$unit(identifier), not allowed', ->
	assert.failAt '''
		body {
			-foo: $unit(px);
		}
	''', {line: 2, column: 14}

test '$unit(), not allowed', ->
	assert.failAt '''
		body {
			-foo: $unit();
		}
	''', {line: 2, column: 8}

test '$unit(number, percentage)', ->
	assert.compileTo '''
		body {
			-foo: $unit(1, 1%);
		}
	''', '''
		body {
			-foo: 1%;
		}
	'''

test '$unit(percentage, dimension)', ->
	assert.compileTo '''
		body {
			-foo: $unit(1%, 2px);
		}
	''', '''
		body {
			-foo: 1px;
		}
	'''

test '$unit(dimension, string)', ->
	assert.compileTo '''
		body {
			-foo: $unit(1%, em);
		}
	''', '''
		body {
			-foo: 1em;
		}
	'''

test '$unit(dimension, empty string)', ->
	assert.compileTo '''
		body {
			-foo: $unit(1%, "");
		}
	''', '''
		body {
			-foo: 1;
		}
	'''

test '$unit(number, percentage string)', ->
	assert.compileTo '''
		body {
			-foo: $unit(1, "%");
		}
	''', '''
		body {
			-foo: 1%;
		}
	'''

test '$unit(number, identifier)', ->
	assert.compileTo '''
		body {
			-foo: $unit(1, px);
		}
	''', '''
		body {
			-foo: 1px;
		}
	'''

test '$unit(number, null) not allowed', ->
	assert.failAt '''
		body {
			-foo: $unit(1, null);
		}
	''', {line: 2, column: 17}

test '$opp(left)', ->
	assert.compileTo '''
		body {
			-foo: $opp(left);
		}
	''', '''
		body {
			-foo: right;
		}
	'''

test "$opp('top')", ->
	assert.compileTo '''
		body {
			-foo: $opp('top');
		}
	''', '''
		body {
			-foo: 'bottom';
		}
	'''

test '$opp(center)', ->
	assert.compileTo '''
		body {
			-foo: $opp(center);
		}
	''', '''
		body {
			-foo: center;
		}
	'''

test '$opp(top right)', ->
	assert.compileTo '''
		body {
			-foo: $opp(top right);
		}
	''', '''
		body {
			-foo: bottom left;
		}
	'''

test '$opp(top 1px), not allowed', ->
	assert.failAt '''
		body {
			-foo: $opp(top 1px);
		}
	''', {line: 2, column: 17}