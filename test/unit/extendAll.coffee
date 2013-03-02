assert = require '../assert'

suite '@extend-all'

test 'extend simple selector', ->
	assert.compileTo '''
		.button.active {
			display: inline-block;
		}

		#submit {
			@extend-all .button;
			border: 1px solid;
		}
	''', '''
		.button.active,
		#submit.active {
			display: inline-block;
		}

		#submit {
			border: 1px solid;
		}
	'''

test 'extend multiple simple selectors', ->
	assert.compileTo '''
		.menu .menu {
			position: absolute;
		}

		.my-menu {
			@extend-all .menu;
		}
	''', '''
		.menu .menu,
		.my-menu .my-menu {
			position: absolute;
		}
	'''

test 'extend compond selector', ->
	assert.compileTo '''
		.button.active .icon {
			float: left;
		}

		#submit {
			@extend-all .button;
		}
	''', '''
		.button.active .icon,
		#submit.active .icon {
			float: left;
		}
	'''

test 'extend selector list', ->
	assert.compileTo '''
		.button.active .icon,
		.tab.active .icon {
			float: left;
		}

		#submit {
			@extend-all .button;
		}
	''', '''
		.button.active .icon,
		.tab.active .icon,
		#submit.active .icon {
			float: left;
		}
	'''