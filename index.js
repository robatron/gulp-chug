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

// Gulp-log with plugin-name prefix
var say = function( msg ) {
    gutil.log( PLUGIN_NAME + ':', msg );
};


// Primary gulp function
module.exports = function ( options ) {

    // Set default options
    var opts = _.assign( {
        nodeCmd: null, // TODO: Implement custom node/gulp commands
        gulpCmd: null,
        gulpOpts: []
    }, options );


    // Create and return a stream through which each file will pass
    return through.obj( function ( file, enc, callback ) {

        // Reference to through object for closures during execution
        var self = this;

        // Since we're not modifying the gulpfile, immediately always push it
        // back on the stream
        self.push( file );

        // Gather gulpfile info
        var gulpfilePath    = file.path;
        var gulpfilePathRel = path.relative( process.cwd(), gulpfilePath );
        var gulpfileDir     = file.base;
        var gulpfileDirRel  = path.relative( process.cwd(), gulpfileDir );
        var gulpfileName    = path.basename( gulpfilePath );

        // Construct command to execute
        var cmd = [
            'gulp',
            '--gulpfile', gulpfileName,
            opts.gulpOpts.join( ' ' )
        ].join( ' ' );


        // Tell user what we're about to do
        say( util.format(
            'Forking new process to run "%s" in directory "%s"...',
            cmd,
            gulpfileDirRel
        ) );


        // Execute gulp command
        exec( cmd, { cwd: gulpfileDir }, function ( err, stdout, stderr ) {

            // Report if there's an error
            if ( err ){
                var errMsg = util.format(
                    'Error executing gulpfile "%s":\n%s',
                    gulpfilePathRel,
                    stderr
                );
                self.emit( 'error', new PluginError( PLUGIN_NAME, errMsg ) );


            // Otherwise, report output from gruntfile
            } else {
                var stdoutLines = stdout.split( gutil.linefeed );
                for( var i = 0; i < stdoutLines.length; ++i ) {
                    gutil.log( util.format(
                        '%s: (%s) %s',
                        PLUGIN_NAME,
                        gulpfilePathRel,
                        stdoutLines[ i ]
                    ) );
                }
            }
        } );


        // TODO: Make this sync so it doesn't return immediately?
        return callback();
    });
};
