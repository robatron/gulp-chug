/**
 * gulp-chug integration "tests" to assure a working state in a less-contrived
 * environment.
 *
 * This is basically a normal gulpfile that runs gulp-chug through some common
 * scenarios.
 *
 * Integration "tests" pass if this gulpfile runs without error.
 */
var gulp        = require( 'gulp' );
var replace     = require( 'gulp-replace' );
var chug        = require( '../index.js' );

// Happy path
gulp.task( 'happy', function () {
    gulp.src( './subproj/gulpfile.js' )
        .pipe( chug() )
} );

// Custom gulpfile file name
gulp.task( 'custom-filename', function () {
    gulp.src( './subproj/gulpfile-custom-name.js' )
        .pipe( chug() )
} );

// Nested gulpfile
gulp.task( 'deep-nest', function () {
    gulp.src( './subproj/subdir/gulpfile.js' )
        .pipe( chug() )
} );

// Glob multiple gulpfiles
gulp.task( 'glob', function () {
    gulp.src( './subproj/**/gulpfile*.js' )
        .pipe( chug() )
} );

// Non-existant gulpfile
gulp.task( 'non-existant', function () {
    gulp.src( './subproj/non-existant-file.js' )
        .pipe( chug() )
} );

// No-read option
gulp.task( 'no-read', function () {
    gulp.src( './subproj/gulpfile.js', { read: false } )
        .pipe( chug() )
} );

// Mess with the gulpfile before running
gulp.task( 'modify-before', function () {
    gulp.src( './subproj/gulpfile.js' )
        .pipe( replace( 'Hello', 'Goodbye' ) )
        .pipe( chug() )
} );

// Make sure it works synchronously
gulp.task( 'sync', function () {
    return gulp.src( './subproj/gulpfile.js' )
        .pipe( chug() )
} );


gulp.task( 'default', [
    'happy',
    'custom-filename',
    'deep-nest',
    'glob',
    'non-existant',
    'no-read',
    'modify-before',
    'sync'
] );
