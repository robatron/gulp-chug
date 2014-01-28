var gulp 		= require( 'gulp' );
var gulpCascade = require( '../index.js' );

gulp.task( 'default', function ( cb ) {
    gulp.src( [
            './submod/gulpfile.js',
            './submod/gulpfile2.js'
        ],
        { read: false }
    )
        .pipe( gulpCascade() )

    cb();
} );
