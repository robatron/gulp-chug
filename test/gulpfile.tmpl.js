/** Gulpfile template to use for testing
*/
var util = require( 'util' );
var fs = require( 'fs' );
var gulp = require( 'gulp' );
var gutil = require( 'gulp-util' );

gulp.task( 'default', function () {
    fs.writeFileSync( '<%= filename %>', '<%= fileContents %>' )
} );
