## 0.9.0 - 2013-10-20

- Expose `roole.use(fn)` to allow defining plugins.
- Expose `roole.on('evaluate', fn)` to allow tapping into the evaluated abstract syntax tree.
- Expose `roole.builtin` to allow adding builtin functions
- Selector lists and selector lists in keyframes are compiled to multiple lines.

## 0.8.0 - 2013-10-18

- `@import`s containing media queryies are converted to `@media`s, if the url is a string.
- If `base` option is not specified, relative URL translations are disabled.

## 0.7.0 - 2013-10-10

- Remove `roole.builtin`
- Add `global` option for importing variables from JavaScript
- Functions added with `roole.use()` are called before prefixing
- Remove `@extend` and `@module`
- Remove media query support after selectors in `@mixin`
- Compile selector lists and media query lists to single lines
- Allow interpolating selector list/media query lists when the variable is the only item in the selector/media query
- Swap `:=` assignments (which now overwrite variables in outer scopes) and `=` assignments (which now force creating a local variable)

## 0.6.2 - 2013-09-24

- Support `:=` assignments, which force creating a local variable
- Make `=` assignments overwrite variables in outer scopes
- Support expression in interpolations (e.g., `"1 + 1 is { 1 + 1 }"`)
- Change module name to class selector (e.g., `@module .icon {}`)
- Add `roole.use()` for extending Roole

## 0.6.1 - 2013-09-21

- Remove `roole.builtin`
- `$img-size()` handles relative urls the same way as core does
- Not adding extension names when importing files

## 0.6.0 - 2013-09-21

- Support unit syntax (e.g., `()%` and `()em`)
- Change default value of precision option to 5
- Support mixin rulesets
- If a string is passed to `$len()`, it returns the length of it
- Relative urls starting with `./` and `../` are relative to the directory of the current file. Others are relative to cwd
- Support importing JavaScript files

## 0.5.1 - 2013-09-11

- Fix `$push()` and `$unshift()` to empty list
- Support assigning using member expression with empty list to remove items

## 0.5.0 - 2013-09-03

- Allow variables in `@import` paths
- Add builtin functions:
	- `$len()`
	- `$unit()`
	- `$opp()`
	- `$pop()`
	- `$push()`
	- `$shift()`
	- `$unshift()`
	- `$img-size()`
- `@function` has lexical scope
- Retain multi-line comments before CSS rules
- Allow importing libraries (e.g, `@import 'tabs';` imports `node_modules/tabs`).
- Retain arithmetic expressions in `calc()`
- Support square bracket list syntax (e.g, `[]`)
- Empty ranges (e.g., `1...1`) evaluate to empty list (i.e., `[]`) instead of `null`
- Support member expression (e.g, `[0 1 2][1]`, `[0 1 2][0..1]`)
- Expose builtin object with `roole.builtin`
- Prefix property `text-overflow` [Mikhail Troshev]
- Relative urls are relative to the directory of the current file

## 0.4.1 - 2013-03-28

- Fix function called within mixin returning incorrect value

## 0.4.0 - 2013-03-26

- Rename `@mixin` to `@function`
- Allow `@function` to return value with `@return`
- Support `$arguments` variable inside `@function`
- Add rest parameter syntax
- Remove `@extend-all` syntax
- Add `@module` syntax
- Add assignment operators (e.g, `+=`, `*=`, etc)
- The prefix option now is a space-separated string
- Support `@page` syntax
- Allow identifier to directly follow & selector (e.g., `$-foo {}`)

## 0.3.1 - 2013-03-08

- Fix bugs relating to selectors

## 0.3.0 - 2013-03-04

- Change syntax to be a superset of CSS
- Make variables case-sensitive
- Add `@extend-all` syntax
- Support `@font-face` syntax
- Support `@charset` syntax

## 0.2.1 - 2013-02-19

- Quit at the first importing error

## 0.2.0 - 2013-02-19

- Auto-compile code in browsers
- Allow the CLI to watch files
- Add travis-ci support

## 0.1.2 - 2013-02-08

- Add generated parser to published npm module

## 0.1.1 - 2013-02-08

- Add MIT lincese file
- Add missing dependency

## 0.1.0 - 2013-02-07

- Initial release