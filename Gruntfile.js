module.exports = function(grunt){
    grunt.initConfig({
        uglify:{
           build:{
             files:{
               'build/output.min.js':['src/main.js',
                                      'src/OBJLoader.js',
                                      'src/three.min.js',
                                      'TrackballControls.js']
             }
           }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
};
