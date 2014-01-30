var assert  = require( 'assert' );
var gulp    = require( 'gulp' );
var chug    = require( '../index.js' );

describe( 'gulp-chug', function () {
    describe( 'in buffer mode', function () {
        describe( 'when working with gulp sourcing', function () {
            it( 'should run a gulpfile', function () {} );
            it( 'should run a gulpfile with a custom name', function () {} );
            it( 'should run a gulpfile nested in subdirectories', function () {
                // Nested once

                // Nested multiple times
            } );
            it( 'should run multiple gulpfiles', function () {
                // Explicitly specified with []

                // Filename wildcard globbing

                // Directory wildcard globbing
            } );
            it( 'should ignore non-existent sources', function () {} );
        } );

        describe( 'when working with modified streams', function () {
            it( 'should run a stream modified by another plugin', function () {} );
            it( 'should run a gulpfile in no-read mode', function () {} );
        } );
    } );
    describe( 'in streaming mode', function () {
        it( 'should emit an error', function() {} );
    } );
} );
