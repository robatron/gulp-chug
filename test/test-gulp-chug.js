var assert  = require( 'assert' );
var gulp    = require( 'gulp' );
var chug    = require( '../index.js' );


describe( 'gulp-chug', function () {
    describe( 'in buffer mode', function () {
        describe( 'when working with gulp sourcing', function () {
            it( 'should run a gulpfile', function () {
                testPlaceholder();
            } );
            it( 'should run a gulpfile with a custom name', function () {
                testPlaceholder();
            } );
            it( 'should run a gulpfile nested in subdirectories', function () {
                testPlaceholder();
                // Nested once

                // Nested multiple times
            } );
            it( 'should run multiple gulpfiles', function () {
                testPlaceholder();
                // Explicitly specified with []

                // Filename wildcard globbing

                // Directory wildcard globbing
            } );
            it( 'should ignore non-existent sources', function () {
                gulp.src( './non-existent-gulpfile.js' ).pipe( chug() );
            } );
        } );

        describe( 'when working with modified streams', function () {
            it( 'should run a stream modified by another plugin', function () {
                testPlaceholder();
            } );
            it( 'should run a gulpfile in no-read mode', function () {
                testPlaceholder();
            } );
        } );
    } );
    describe( 'in streaming mode', function () {
        it( 'should emit an error', function() {
            testPlaceholder();
        } );
    } );
} );


/** Test placeholder. Call in unimplemented test cases to fail the test case.
*/
var testPlaceholder = function () {
    throw new Error( 'Test not yet implemented.');
};
