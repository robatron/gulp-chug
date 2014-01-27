var util        = require( 'util' );
var path        = require( 'path' );
var exec        = require( 'child_process' ).exec;

var _           = require( 'lodash' );
var through     = require( 'through2' );
var gutil       = require( 'gulp-util' );
var PluginError = gutil.PluginError;


// Name of this plugin
const PLUGIN_NAME   = require( './package.json' ).name;

// Name the gulpfile must be for gulp to run it
const DEFAULT_GULPFILE_NAME = 'gulpfile.js';


// Primary gulp function
module.exports = function ( options ) {

    // Set default options
    var opts = _.assign( {
        nodeCmd: null, // TODO: Implement custom node/gulp commands
        gulpCmd: null,
        gulpOpts: []
    }, options );


    // Create a stream through which each file will pass
    var stream = through.obj( function ( file, enc, callback ) {


        // Since we're not modifying the gruntfile, always push it back on the
        // stream.
        this.push( file );


        // If file has no contents ( either file doesn't exist, or { read: false } set in gulp.src )
        // TODO: Implement
        if ( file.isNull() ) {
            console.log( 'File is null' );
            return callback();
        }

        // If file is a buffer (gulp.src is buffer by default)
        if ( file.isBuffer() ) {
            console.log( 'File is a buffer' );

            // Compose gulp command
            var cmd = [
                'gulp',
                '--gulpfile', path.basename( file.path ),
                opts.gulpOpts.join( ' ' )
            ].join( ' ' );

            // Grab the gulpfile directory
            var gulpfileDir = file.base;

            gutil.log( PLUGIN_NAME + ':', 'Running command \'' + cmd + '\'...');
            gutil.log( PLUGIN_NAME + ':', 'In directory \'' + gulpfileDir + '\'...');

            // Execute gulp command
            exec( cmd, { cwd: gulpfileDir }, function ( err, stdout, stderr ) {

                if ( err ){
                    var erroMsg = 'Error executing gulpfile:' + stderr;
                    this.emit( 'error', new PluginError( PLUGIN_NAME, errMsg ) );

                } else {
                    var stdoutLines = stdout.split( gutil.linefeed );
                    for( var i = 0; i < stdoutLines.length; ++i ) {
                        gutil.log( PLUGIN_NAME + ':\t', stdoutLines[ i ] );
                    }
                }
            } );

            // TODO: Make this sync so it doesn't return immediately
            return callback();
        }

        // If file is a stream ( { buffer: false } in gulp.src )
        // TODO: Implement. (Does this actually matter?)
        if ( file.isStream() ) {
            this.emit( 'error', new PluginError( PLUGIN_NAME, 'Streams are not supported :(' ) );
            return callback();
        }
    });


    // Return the file stream for piping into other plugins
    return stream;
};
