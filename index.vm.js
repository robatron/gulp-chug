var util        = require( 'util' );
var path        = require( 'path' );
var vm          = require( 'vm' );

var _           = require( 'lodash' );
var through     = require( 'through2' );
var asyncblock  = require( 'asyncblock' );
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


    // Create and return a stream through which each file will pass
    return through.obj( function ( file, enc, callback ) {


        // Since we're not modifying the gruntfile, always push it back,
        // unmodified on the stream for successive gulp plugins
        this.push( file );


        // If file has no contents (either file doesn't exist, or
        // { read: false } set in `gulp.src`.)
        if ( file.isNull() ) {
            this.emit( 'error', new PluginError( PLUGIN_NAME, 'Specified gulpfile is null.' ) );
            return callback();
        }


        // If file is a stream ( { buffer: false } in gulp.src )
        // TODO: Implement
        if ( file.isStream() ) {
            this.emit( 'error', new PluginError( PLUGIN_NAME, 'Streams are not supported.' ) );
            return callback();
        }

        if ( file.isBuffer() ) {
            var gulpfileScript = vm.createScript( file.contents );
            gulpfileScript.runInNewContext({require:require});
        }

        return callback();
    });
};
