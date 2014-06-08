describe( 'gulp-chug', function () {
    it( 'emits an error if supplied a stream' );
    it( 'creates a temporary gulpfile if supplied a buffer' );
    it( 'emits an error if a locally-installd gulpfile cannot be found' );
    it( 'spawns a process to execute the target gulpfile' );
    it( 'handles target gulpfile execution errors' );
    it( 'outputs stdout and stderr of the target gulpfile during execution' );
    it( 'cleans up any temporary gulpfiles on exit' );
} );
