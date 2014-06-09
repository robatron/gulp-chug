var _       = require( 'lodash' );
var pequire = require( 'proxyquire' ).noCallThru();
var sinon   = require( 'sinon' );
var should  = require( 'should' );

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

    xit( 'creates a temporary gulpfile next to the original gulpfile if supplied a buffer', function () {
        var pdeps = {
            fs: {
                writeFileSync: sinon.spy()
            },
            path: {
                join: sinon.spy( function () {
                    return 'path-join-return'
                } ),
                relative: _.noop,
                basename: _.noop,
                extname: _.noop
            }
        };
        var chug = pequire( '../index.js', pdeps );
        var stream = chug();
        var streamFile = {
            isNull: function () { return false },
            isStream: function () { return false },
            isBuffer: function () { return true },
            path: '/gulpfile.js',
            base: '/',
            contents: 'file-contents'
        };
        stream.write( streamFile );
    } );

    it( 'emits an error if a locally-installd gulpfile cannot be found' );
    it( 'spawns a process to execute the target gulpfile' );
    it( 'handles target gulpfile execution errors' );
    it( 'outputs stdout and stderr of the target gulpfile during execution' );
    it( 'cleans up any temporary gulpfiles on exit' );
} );
