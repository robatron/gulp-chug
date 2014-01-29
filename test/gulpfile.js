/** Ghetto testing. Run `gulp` from this directory, and things should happen
    without error.

    TODO: Impement proper testing framework, e.g., mocha
*/
var gulp 		= require( 'gulp' );
var gulpCascade = require( '../index.js' );

gulp.task( 'default', function () {
    gulp.src( './subproj/gulpfile*' )
        .pipe( gulpCascade() )

} );
