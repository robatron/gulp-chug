gulp-chug [![NPM version][npm-badge-img]][npm-url]
=========

A [gulp][gulp-url] plugin for running external gulpfiles as part of a task inside another gulpfile.

**Note:** gulp-chug will *not* modify the stream, but will accept a modified
stream, and will return the stream as received like normal.

Inspired by [@shama](https://github.com/shama)'s [grunt-hub](https://github.com/shama/grunt-hub).


Install
-------

Install with [npm](https://npmjs.org/package/gulp-chug):

```sh
npm install gulp-chug --save
```

Usage
-----

Run an external gulpfile:

```javascript
var gulp = require( 'gulp' );
var chug = require( 'gulp-chug' );

gulp.task( 'default', function () {
    gulp.src( './subproj/gulpfile.js' )
        .pipe( chug() )
} );
```

Run multiple external gulpfiles:

```javascript
var gulp = require( 'gulp' );
var chug = require( 'gulp-chug' );

gulp.task( 'default', function () {
    gulp.src( './**/gulpfile.js' )
        .pipe( chug() )
} );
```

Pre-process the gulpfile before running it:

```javascript
gulp.task( 'default', function () {
    gulp.src( './subproj/gulpfile.js' )
        .pipe( replace( 'Hello', 'Goodbye' ) )
        .pipe( chug() )
} );
```

Make gulp-chug a little faster by not reading the source stream with `{ read: false }`:

```javascipt
gulp.task( 'default', function () {
    gulp.src( './subproj/gulpfile.js', { read: false } )
        .pipe( chug() )
} );
```

Licence
-------
The MIT License (MIT)

Copyright (c) 2014 Rob McGuire-Dale

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[npm-badge-img]: https://badge.fury.io/js/gulp-chug.png
[npm-url]: https://npmjs.org/package/gulp-chug
[gulp-url]: https://github.com/wearefractal/gulp
