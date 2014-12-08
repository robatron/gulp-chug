'use strict';

var util = require( 'util' );
var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );

gulp.task( 'default', function () {
    gutil.log( util.format( 'Hello from %s!', __filename ) );
} );
