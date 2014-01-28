var gulp 		= require( 'gulp' );
var gulpCascade = require( '../index.js' );

gulp.task( 'default', function () {
    gulp.src( [ './submod/gulpfile.js', './submod/gulpfile2.js' ] )
        .pipe( gulpCascade() )
} );
