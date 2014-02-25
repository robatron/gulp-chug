var util        = require( 'util' );
var path        = require( 'path' );
var fs          = require( 'fs' );
var exec        = require( 'child_process' ).exec;

var _           = require( 'lodash' );
var through     = require( 'through2' );
var resolve     = require( 'resolve' );
var gutil       = require( 'gulp-util' );
var PluginError = gutil.PluginError;


// Name of this plugin
const PLUGIN_NAME   = require( './package.json' ).name;


// Primary gulp function
module.exports = function ( options ) {

    // Set default options
    var opts = _.assign( {
        nodeCmd: 'node',
        tasks: [ 'default' ]
    }, options );


    // Create a stream through which each file will pass
    return through.obj( function ( file, enc, callback ) {

        // Grab reference to this through object
        var self = this;


        // Since we're not modifying the gulpfile, always push it back on the
        // stream.
        self.push( file );


        // Configure logging and errors
        var say = function( msg ) {
            console.log( util.format( '[%s]', gutil.colors.green( PLUGIN_NAME ) ), msg );
        };

        var sayErr = function( errMsg ) {
            self.emit( 'error', new PluginError( PLUGIN_NAME, errMsg ) );
        };


        // Error if file contents is stream ( { buffer: false } in gulp.src )
        // TODO: Add support for a streams
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
        if( file.isNull() ){
            say( util.format(
                'Gulpfile, %s, contents is empty. Reading directly from disk...',
                gulpfile.name
            ) );
        }


        // If file contents is a buffer, write a temp file and run that instead
        if( file.isBuffer() ) {

            say( 'File is a buffer. Need to write buffer to temp file...')

            var tmpGulpfileName = util.format(
                '%s.tmp.%s%s',
                path.basename( gulpfile.name, gulpfile.ext ),
                new Date().getTime(),
                gulpfile.ext
            );

            // Tweak gulpfile info to account for temp file
            gulpfile.origPath       = gulpfile.path;
            gulpfile.path           = path.join( gulpfile.base, tmpGulpfileName );
            gulpfile.tmpPath        = gulpfile.path;
            gulpfile.origRelPath    = gulpfile.relPath;
            gulpfile.relPath        = path.relative( process.cwd(), gulpfile.path );
            gulpfile.name           = tmpGulpfileName;

            say( util.format(
                'Writing buffer to %s...',
                gutil.colors.magenta( gulpfile.relPath )
            ) )

            // Write tmp file to disk
            fs.writeFileSync( gulpfile.path, file.contents );
        }


        // Find local gulp cli script
        try {
            var localGulpPackageBase    = path.dirname( resolve.sync( 'gulp', { basedir: gulpfile.base } ) );
            var localGulpPackage        = require( path.join( localGulpPackageBase, 'package.json' ) );
            var localGulpCliPath        = path.resolve( path.join( localGulpPackageBase, localGulpPackage.bin.gulp ) );
        } catch( err ) {
            sayErr( util.format(
                'Problem finding locally-installed `gulp` for gulpfile %s. ' +
                '(Try running `npm install gulp` from %s to install a local ' +
                'gulp for said gulpfile.)\n\n%s',
                gutil.colors.magenta( gulpfile.origPath ),
                gutil.colors.magenta( gulpfile.base ),
                err
            ) );
            return callback();
        }


        // Construct gulp command
        var cmd = [
            opts.nodeCmd,
            localGulpCliPath,
            '--gulpfile', gulpfile.name,
            opts.tasks.join( ' ' )
        ].join( ' ' );


        say( 'Running command \'' + cmd + '\'...');


        // Execute local gulp cli script
        exec( cmd, { cwd: gulpfile.base }, function ( err, stdout, stderr ) {

            // Log output from gulpfile
            if ( ! err ) {
                var stdoutLines = stdout.split( gutil.linefeed );
                for( var i = 0; i < stdoutLines.length; ++i ) {
                    say( util.format( '(%s) %s',
                        gutil.colors.magenta( gulpfile.relPath ),
                        stdoutLines[ i ]
                    ) );
                }

            } else {
                sayErr( 'Error executing gulpfile: ' + stderr );
            }


            // Remove temp file if one exists
            if( gulpfile.tmpPath ) {
                say( util.format( 'Removing temp file %s', gulpfile.tmpPath ) );
                fs.unlinkSync( gulpfile.tmpPath );
            }


            // Tell gulp (and the user) we're done!
            say( 'Returning to parent gulpfile...' );
            callback();
        } );

    } );
};
