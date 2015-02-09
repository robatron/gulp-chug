'use strict';

var fs          = require( 'fs' );
var path        = require( 'path' );
var util        = require( 'util' );
var spawn       = require( 'child_process' ).spawn;

var _           = require( 'lodash' );
var through     = require( 'through2' );
var resolve     = require( 'resolve' );
var gutil       = require( 'gulp-util' );
var PluginError = gutil.PluginError;

var PKG         = require( './package.json' );

// Primary gulp function
module.exports = function ( options ) {

    // Create a stream through which each file will pass
    return through.obj( function ( file, enc, callback ) {

        // Grab reference to this through object
        var self = this;

        // Since we're not modifying the gulpfile, always push it back on the
        // stream.
        self.push( file );

        // Set default options
        var opts = _.assign( {
            nodeCmd: 'node',
            tasks: [ 'default' ],

            // Log output coming from gulpfile stdout and stderr
            output: function( data , scope ) {
                scope.say( util.format( '(%s) %s',
                    gutil.colors.magenta( scope.gulpfile.relPath ),
                    data.toString()
                ) );
            }
        }, options );

        // Configure logging and errors
        self.say = function( msg, noNewLine ) {
            var sayFn = noNewLine ? console.log : util.print;
            sayFn( util.format( '[%s]', gutil.colors.green( PKG.name ) ), msg );
        };

        var sayErr = function( errMsg ) {
            self.emit( 'error', new PluginError( PKG.name, errMsg ) );
        };

        // Error if file contents is stream ( { buffer: false } in gulp.src )
        // TODO: Add support for a streams
        if ( file.isStream() ) {
            sayErr( 'Streams are not supported yet. Pull requests welcome :)' );
            return callback();
        }

        // Gather target gulpfile info
        self.gulpfile = {};
        self.gulpfile.path       = file.path;
        self.gulpfile.relPath    = path.relative( process.cwd(), self.gulpfile.path );
        self.gulpfile.base       = path.dirname( file.path );
        self.gulpfile.relBase    = path.relative( process.cwd(), self.gulpfile.base );
        self.gulpfile.name       = path.basename( self.gulpfile.path );
        self.gulpfile.ext        = path.extname( self.gulpfile.name );

        // If file contents is null, { read: false }, just execute file as-is
        // on disk
        if( file.isNull() ){
            self.say( util.format(
                'Gulpfile, %s, contents is empty. Reading directly from disk...',
                self.gulpfile.name
            ), true );
        }

        // If file contents is a buffer, write a temp file and run that instead
        if( file.isBuffer() ) {

            self.say( 'File is a buffer. Need to write buffer to temp file...', true );

            var tmpGulpfileName = util.format(
                '%s.tmp.%s%s',
                path.basename( self.gulpfile.name, self.gulpfile.ext ),
                new Date().getTime(),
                self.gulpfile.ext
            );

            // Tweak gulpfile info to account for temp file
            self.gulpfile.origPath       = self.gulpfile.path;
            self.gulpfile.path           = path.join( self.gulpfile.base, tmpGulpfileName );
            self.gulpfile.tmpPath        = self.gulpfile.path;
            self.gulpfile.origRelPath    = self.gulpfile.relPath;
            self.gulpfile.relPath        = path.relative( process.cwd(), self.gulpfile.path );
            self.gulpfile.name           = tmpGulpfileName;

            self.say( util.format(
                'Writing buffer to %s...',
                gutil.colors.magenta( self.gulpfile.relPath )
            ), true );

            // Write tmp file to disk
            fs.writeFileSync( self.gulpfile.path, file.contents );
        }

        // Find local gulp cli script
        var localGulpPackage        = null;
        var localGulpPackageBase    = null;
        var localGulpCliPath        = null;
        try {
            localGulpPackageBase    = path.dirname( resolve.sync( 'gulp', { basedir: self.gulpfile.base } ) );
            localGulpPackage        = require( path.join( localGulpPackageBase, 'package.json' ) );
            localGulpCliPath        = path.resolve( path.join( localGulpPackageBase, localGulpPackage.bin.gulp ) );
        } catch( err ) {
            sayErr( util.format(
                'Problem finding locally-installed `gulp` for gulpfile %s. ' +
                '(Try running `npm install gulp` from %s to install a local ' +
                'gulp for said gulpfile.)\n\n%s',
                gutil.colors.magenta( self.gulpfile.origPath ),
                gutil.colors.magenta( self.gulpfile.base ),
                err
            ) );
            return callback();
        }

        // Construct command and args
        var cmd = opts.nodeCmd;

        var args = [
            localGulpCliPath, '--gulpfile', self.gulpfile.name
        ].concat(opts.tasks);

        // Concatinate additional command-line arguments if provided
        if ( _.isArray( opts.args ) || _.isString( opts.args ) ) {
            args = args.concat( opts.args );
        }

        self.say(
            'Spawning process ' + gutil.colors.magenta( localGulpCliPath ) +
            ' with args ' + gutil.colors.magenta( args.join( ' ' ) ) +
            ' from directory ' + gutil.colors.magenta( self.gulpfile.base ) + '...'
        , true );

        // Execute local gulpfile cli script
        var spawnedGulp = spawn( cmd, args, { cwd: self.gulpfile.base } );

        // Remove temp file if one exists
        var cleanupTmpFile = function () {
            try {
                if( self.gulpfile.tmpPath ) {
                    self.say( util.format( 'Removing temp file %s', self.gulpfile.tmpPath ), true );
                    fs.unlinkSync( self.gulpfile.tmpPath );
                }
            } catch ( e ) {
                // Wrap in try/catch because when executed due to ctrl+c,
                // we can't unlink the file
            }
        };

        // Handle errors in gulpfile
        spawnedGulp.on( 'error', function ( error ) {
            sayErr( util.format(
                'Error executing gulpfile %s:\n\n%s',
                gutil.colors.magenta( self.gulpfile.path ),
                error
            ) );
        } );

        // Handle gulpfile stdout and stderr
        spawnedGulp.stdout.on( 'data', function( data ) {
            return opts.output( data, self );
        } );
        spawnedGulp.stderr.on( 'data', function( data ) {
            return opts.output( data, self );
        } );

        // Clean up temp gulpfile exit
        spawnedGulp.on( 'exit', function ( exitCode ) {
            cleanupTmpFile();

            if ( exitCode === 0 ) {
                self.say( 'Returning to parent gulpfile...', true );
            } else {
                sayErr( util.format(
                    'Gulpfile %s exited with an error :(',
                    gutil.colors.magenta( self.gulpfile.path )
                ) );
            }

            callback();
        } );

        // Clean up temp gulpfile if on ctrl + c
        process.on( 'SIGINT', cleanupTmpFile );
    } );
};
