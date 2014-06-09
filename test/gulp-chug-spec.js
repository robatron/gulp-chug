/**
 * gulp-chug test spec file
 *
 * TODO: Use sinon sandboxes to suppress console output from gulp-chug
 */
var util    = require( 'util' );
var path    = require( 'path' );
var _       = require( 'lodash' );
var pequire = require( 'proxyquire' ).noCallThru();
var sinon   = require( 'sinon' );
var should  = require( 'should' );
var gutil   = require( 'gulp-util' );

// Happy-path proxy dependencies
var proxyDeps = {
    fs: {
        writeFileSync: _.noop
    },
    path: {
        relative: _.noop,
        dirname: _.noop,
        basename: _.noop,
        extname: _.noop,
        join: function () { return 'path-join-return' },
        resolve: _.noop
    },
    resolve: {
        sync: _.noop
    },
    'path-join-return': {
        bin: {
            gulp: 'gulp-cli-bin'
        }
    },
    child_process: {
        spawn: function () {
            return {
                on: _.noop,
                stdout: {
                    on: _.noop
                },
                stderr: {
                    on: _.noop
                }
            }
        }
    },
    './package.json': {
        name: 'gulp-chug-proxy'
    }
};

// Return proxy dependencies with optional overrides
var getProxyDeps = function ( overrides ) {
    return _.assign( {}, proxyDeps, overrides || {} );
};

describe( 'gulp-chug', function () {

    it( 'emits an error if supplied a stream', function ( done ) {
        var chug = require( '../index.js' );
        var stream = chug();
        var streamFile = {
            isNull: function () { return false },
            isStream: function () { return true }
        };
        stream.on( 'error', function ( err ) {
            err.message.should.equal( 'Streams are not supported yet. Pull requests welcome :)' );
            done();
        } );
        stream.write( streamFile );
    } );

    it( 'creates a temporary gulpfile if supplied a buffer', function () {
        var pdeps = getProxyDeps( {
            fs: {
                writeFileSync: sinon.spy()
            }
        } );
        var chug = pequire( '../index.js', pdeps );
        var stream = chug();
        var streamFile = {
            isNull:     function () { return false },
            isStream:   function () { return false },
            isBuffer:   function () { return true },
            contents: 'file-contents'
        };
        stream.write( streamFile );

        pdeps.fs.writeFileSync.calledOnce.should.be.true;
        pdeps.fs.writeFileSync.calledWith( 'path-join-return', streamFile.contents ).should.be.true;
    } );

    describe( 'during failures to find a local gulp', function () {

        var ERR_MSG_BEGIN = 'Problem finding locally-installed `gulp` for gulpfile';

        var streamFile = {
            isNull:     function () { return false },
            isStream:   function () { return false },
            isBuffer:   function () { return true }
        };

        it( 'emits an error if a local gulp cannot be found', function ( done ) {
            var pdeps = getProxyDeps( {
                resolve: { sync: function () { throw new Error() } }
            } );
            var chug = pequire( '../index.js', pdeps );
            var stream = chug();
            stream.on( 'error', function ( err ) {
                err.message.should.startWith( ERR_MSG_BEGIN )
                done();
            } );
            stream.write( streamFile );
        } );

        it( 'emits an error if the local gulp\'s package file cannot be loaded', function ( done ) {
            var pdeps = getProxyDeps( {
                path: _.assign( {}, getProxyDeps().path, {
                    dirname: function () { return 'dirname-return' },
                    join: function ( a, b ) {
                        if( a === 'dirname-return' && b === 'package.json' ) {
                            throw new Error();
                        }
                    }
                } )
            } );
            var chug = pequire( '../index.js', pdeps );
            var stream = chug();
            stream.on( 'error', function ( err ) {
                err.message.should.startWith( ERR_MSG_BEGIN )
                done();
            } );
            stream.write( streamFile );
        } );

    } );

    it( 'spawns a process to execute the target gulpfile' );
    it( 'handles target gulpfile execution errors' );
    it( 'outputs stdout and stderr of the target gulpfile during execution' );
    it( 'cleans up any temporary gulpfiles on exit' );
} );
