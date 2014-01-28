var gulp 		= require( 'gulp' );
var gulpCascade = require( '../index.js' );

gulp.task( 'run-submod-gulpfile', function () {
    gulp.src( './submod/gulpfile.js' ).pipe( gulpCascade() );
} );

gulp.task( 'default', [ 'run-submod-gulpfile' ] );
