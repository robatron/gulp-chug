var util        = require( 'util' );
var fs          = require( 'fs' );
var path        = require( 'path' );
var exec        = require( 'child_process' ).exec;

var _           = require( 'lodash' );
var through     = require( 'through2' );
var gutil       = require( 'gulp-util' );
var prettyTime  = require( 'pretty-hrtime' );
var PluginError = gutil.PluginError;


// Name of this plugin
const PLUGIN_NAME   = require( './package.json' ).name;


// Logging
// =======
var say = function( msg ) {
    gutil.log( util.format( '[%s] ', gutil.colors.green( PLUGIN_NAME ) ), msg );
};

var sayErr = function( errMsg ) {
    self.emit( 'error', new PluginError( PLUGIN_NAME, errMsg ) );
}

// format orchestrator errors
var formatError = function ( e ) {
  if ( !e.err ) return e.message;
  if ( e.err.message ) return e.err.message;
  return JSON.stringify( e.err );
}

// Logging events
var logEvents = function ( gulp ) {
    gulp.on( 'task_start', function( e ) {
        say( util.format( 'Running "%s"...', gutil.colors.cyan( e.task ) ) );
    } );

    gulp.on( 'task_stop', function( e ) {
        var time = prettyTime( e.hrDuration );
        say( util.format(
            'Finished "%s" in %s', gutil.colors.cyan(e.task),
            gutil.colors.magenta(time)
        ) );
    } );

    gulp.on( 'task_err', function( e ) {
        var msg     = formatError( e );
        var time    = prettyTime( e.hrDuration );
        say( util.format(
            'Errored "%s" in %s %s', gutil.colors.cyan( e.task ),
            gutil.colors.magenta( time ), gutil.colors.red( msg )
        ) );
    } );

    gulp.on( 'task_not_found', function( err ){
        say( gutil.colors.red( util.format(
            'Task "%s" was not found in the gulpfile.', err.task
        ) ) );
        process.exit( 1 );
    });
}


// Primary gulp function
module.exports = function ( options ) {

    // Set default options
    var opts = _.assign( {
        tasksToRun: [ 'default' ]
    }, options );


    // Create and return a stream through which each file will pass
    return through.obj( function ( file, enc, callback ) {

        var self = this;


        // Push unmodified gulpfile back onto stream for next plugin(s) since
        // we're not modifying it
        self.push( file );


        // Error if file contents is stream ( { buffer: false } in gulp.src )
        // TODO: Add support for a stream later
        if ( file.isStream() ) {
            sayErr( 'Streams are not supported at this time. Sorry!' );
            return callback();
        }


        // Gather gulpfile info
        var gulpfile = {};
        gulpfile.path       = file.path;
        gulpfile.relPath    = path.relative( process.cwd(), gulpfile.path );
        gulpfile.base       = file.base;
        gulpfile.relBase    = path.relative( process.cwd(), gulpfile.base );
        gulpfile.name       = path.basename( gulpfile.path );
        gulpfile.ext        = path.extname( gulpfile.name );


        // If file contents is null, { read: false }, just execute file as-is
        // on disk
        // TODO: Implement
        if( file.isNull() ){
            say( util.format(
                'Gulpfile, %s, contents is empty. Reading directly from disk...',
                gulpfile.name
            ) );
        }


        // If file contents is a buffer, write a temp file and run that instead
        if( file.isBuffer() ) {

            var tmpGulpfileName = util.format(
                '%s.tmp.%s%s',
                path.basename( gulpfile.name, gulpfile.ext ),
                new Date().getTime(),
                gulpfile.ext
            );

            say( util.format(
                'Gulpfile "%s" contents is a buffer. Writing to temp file "%s" before reading...',
                gulpfile.name, tmpGulpfileName
            ) );

            // Tweak gulpfile info to account for temp file
            gulpfile.path    = path.join( gulpfile.base, tmpGulpfileName );
            gulpfile.relPath = path.relative( process.cwd(), gulpfile.path );
            gulpfile.name    = tmpGulpfileName;

            // Write tmp file to disk
            fs.writeFileSync( gulpfile.path, file.contents );
        }


        // Cleanup temp file
        if( file.isBuffer() ){
            say( util.format( 'Cleaning up temp file "%s"...', gulpfile.relPath ) );
            fs.unlinkSync( gulpfile.path );
        }


        // TODO: Make this sync so it doesn't return immediately?
        return callback();
    });
};
