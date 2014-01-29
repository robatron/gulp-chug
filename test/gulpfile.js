/** Ghetto testing. Run `gulp` from this directory, and things should happen
    without error.

    TODO: Impement proper testing framework, e.g., mocha
*/
var gulp 		= require( 'gulp' );
var replace     = require( 'gulp-replace' );
var gulpCascade = require( '../index.js' );

gulp.task( 'happy', function () {
    gulp.src( './subproj/gulpfile.js' )
        .pipe( gulpCascade() )
} );

gulp.task( 'custom-filename', function () {
    gulp.src( './subproj/gulpfile-custom-name.js' )
        .pipe( gulpCascade() )
} );

gulp.task( 'deep-nest', function () {
    gulp.src( './subproj/subdir/gulpfile.js' )
        .pipe( gulpCascade() )
} );

gulp.task( 'glob', function () {
    gulp.src( './subproj/**/gulpfile*.js' )
        .pipe( gulpCascade() )
} );

gulp.task( 'non-existant', function () {
    gulp.src( './subproj/non-existant-file.js' )
        .pipe( gulpCascade() )
} );

gulp.task( 'no-read', function () {
    gulp.src( './subproj/gulpfile.js', { read: false } )
        .pipe( gulpCascade() )
} );

gulp.task( 'modify-before', function () {
    gulp.src( './subproj/gulpfile.js' )
        .pipe( replace( 'Hello', 'Goodbye' ) )
        .pipe( gulpCascade() )
} );

gulp.task( 'default', [
    'happy',
    'custom-filename',
    'deep-nest',
    'glob',
    'non-existant',
    'no-read',
    'modify-before'
] );
