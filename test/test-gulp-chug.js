var fs      = require( 'fs' );
var path    = require( 'path' );
var assert  = require( 'assert' );
var _       = require( 'lodash' );
var gulp    = require( 'gulp' );
var gutil   = require( 'gulp-util' );
var mkpath  = require( 'mkpath' );
var rimraf  = require( 'rimraf' );
var chug    = require( '../index.js' );


process.chdir( __dirname );

const TESTBED_DIRNAME = 'testbed';
const DEFAULT_TMPL_CONTEXT  = {
    filename: 'generated-file',
    fileContents: 'foo'
};

// Capture gulpfile template
var gulpfileTmplSrc         = fs.readFileSync( 'gulpfile.tmpl.js' );
var gulpfileTmpl            = _.template( gulpfileTmplSrc );


describe( 'gulp-chug', function () {

    describe( 'in buffer mode', function () {

        describe( 'when working with gulp sourcing', function () {

            beforeEach( function () {
                mkpath.sync( TESTBED_DIRNAME );
            } );

            afterEach( function () {
                //rimraf.sync( TESTBED_DIRNAME );
            } );

            it( 'should run a gulpfile', function ( done ) {

                var fakeFile = new gutil.File( {
                    path: path.join( path.resolve( TESTBED_DIRNAME ), 'gulpfile.js' ),
                    contents: new Buffer( gulpfileTmpl( DEFAULT_TMPL_CONTEXT ) )
                } );

                console.log( '>>>', fakeFile.path );

                var myChugger = chug();

                myChugger.write( fakeFile );

                // wait for the file to come back out
                myChugger.once( 'data', function ( file ) {

                    // Make sure it came out the same way it went in
                    assert( file.isBuffer() );

                    // check the contents
                    assert.equal(
                        file.contents.toString('utf8'),
                        gulpfileTmpl( DEFAULT_TMPL_CONTEXT )
                    );

                    done();
                  });
            } );

            xit( 'should run a gulpfile with a custom name', function () {
                testPlaceholder();
            } );

            xit( 'should run a gulpfile nested in subdirectories', function () {
                testPlaceholder();
                // Nested once

                // Nested multiple times
            } );

            xit( 'should run multiple gulpfiles', function () {
                testPlaceholder();
                // Explicitly specified with []

                // Filename wildcard globbing

                // Directory wildcard globbing
            } );

            xit( 'should ignore non-existent sources', function () {
                testPlaceholder();
            } );

        } );

        describe( 'when working with modified streams', function () {

            xit( 'should run a stream modified by another plugin', function () {
                testPlaceholder();
            } );

            xit( 'should run a gulpfile in no-read mode', function () {
                testPlaceholder();
            } );

        } );
    } );
    describe( 'in streaming mode', function () {

        xit( 'should emit an error', function() {
            testPlaceholder();
        } );

    } );

} );


/** Test placeholder. Call in unimplemented test cases to fail the test case.
*/
var testPlaceholder = function () {
    throw new Error( 'Test not yet implemented.');
};
