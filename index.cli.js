var util        = require( 'util' );
var fs          = require( 'fs' );
var path        = require( 'path' );
var exec        = require( 'child_process' ).exec;

var _           = require( 'lodash' );
var through     = require( 'through2' );
var gutil       = require( 'gulp-util' );
var prettyTime  = require( 'pretty-hrtime' );
var resolve     = require( 'resolve' );
var semver      = require( 'semver' );
var PluginError = gutil.PluginError;


// Name of this plugin
const PLUGIN_NAME   = require( './package.json' ).name;


// Helpers
// =======

// Logging
// -------
var say = function( msg ) {
    gutil.log( util.format( '%s:', gutil.colors.green( PLUGIN_NAME ) ), msg );
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
        say( util.format( 'Running \'%s\'...', gutil.colors.cyan( e.task ) ) );
    } );

    gulp.on( 'task_stop', function( e ) {
        var time = prettyTime( e.hrDuration );
        say( util.format(
            'Finished \'%s\' in %s', gutil.colors.cyan(e.task),
            gutil.colors.magenta(time)
        ) );
    } );

    gulp.on( 'task_err', function( e ) {
        var msg     = formatError( e );
        var time    = prettyTime( e.hrDuration );
        say( util.format(
            'Errored \'%s\' in %s %s', gutil.colors.cyan( e.task ),
            gutil.colors.magenta( time ), gutil.colors.red( msg )
        ) );
    } );

    gulp.on( 'task_not_found', function( err ){
        say( gutil.colors.red( util.format(
            'Task \'%s\' was not found in the gulpfile.', err.task
        ) ) );
        process.exit( 1 );
    });
}


// Module finders
// --------------
var findLocalModule = function( modName, baseDir ) {
    try {
        return require( resolve.sync( modName, { basedir: baseDir } ) );
    } catch( e ) {}
    return;
}

var findLocalGulp = function( gulpFile ) {
    var baseDir = path.resolve( path.dirname( gulpFile ) );
    return findLocalModule( 'gulp', baseDir );
}


// Gulp runners
// ------------
function startGulp( localGulp, tasks ) {
  // impose our opinion of "default" tasks onto orchestrator
  var toRun = tasks.length ? tasks : [ 'default' ];
  return localGulp.start.apply( localGulp, toRun );
}

function loadGulpFile( localGulp, gulpFile, tasks ){

    // Fill the gulp singleton with the tasks of the gulpfile
    var theGulpfile = require( gulpFile );

    startGulp( localGulp, tasks );

    return theGulpfile;
}


// Gulp Plugin Function
// ====================
module.exports = function ( options ) {

    // Set default options
    var opts = _.assign( {
        tasks: [ 'default' ]
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

            // Tweak gulpfile info to account for temp file
            gulpfile.path    = path.join( gulpfile.base, tmpGulpfileName );
            gulpfile.relPath = path.relative( process.cwd(), gulpfile.path );
            gulpfile.name    = tmpGulpfileName;

            say( util.format(
                'Writing buffer to %s...',
                gutil.colors.magenta( gulpfile.relPath )
            ) )

            // Write tmp file to disk
            fs.writeFileSync( gulpfile.path, file.contents );
        }


        // Find the local gulp, error if not found
        var localGulp = findLocalGulp( gulpfile.path );

        if ( !localGulp ) {
            sayErr(
                gutil.colors.red( 'No local gulp install found in' ) + ' ' +
                gutil.colors.magenta( gulpfile.relPath )
            );
            return callback();
        }


        // Wire up logging for tasks on local gulp singleton
        logEvents( localGulp );

        console.log( localGulp )

        // Load the gulpfile and run it
        say( util.format( 'Using file %s', gutil.colors.magenta( gulpfile.relPath ) ) );
        loadGulpFile( localGulp, gulpfile.path, opts.tasks );


        // Cleanup temp file
        if( file.isBuffer() ){
            say( util.format( 'Cleaning up temp file "%s"...', gulpfile.relPath ) );
            fs.unlinkSync( gulpfile.path );
        }


        // TODO: Make this sync so it doesn't return immediately?
        return callback();
    });
};
