var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

var sys = require('sys');
var exec = require('child_process').exec;

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var yeomanConfig = {
    app: 'src',
    dist: 'dist'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,
    name: 'get in there!',

    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*'
          ]
        }]
      },
      temp: {
        files: [{
          dot: true,
          src: [
            '.tmp'
          ]
        }]
      }
    },

    useminPrepare: {
      options: {
        dest: '<%= yeoman.dist %>'
      },
      html: '<%= yeoman.app %>/index.html'
    },
    usemin: {
      options: {
        dirs: ['<%= yeoman.dist %>']
      },
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/css/{,*/}*.css']
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'img/{,*/}*.{webp,gif}',
            'css/fonts/*'
          ]
        }]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%= yeoman.app %>/css',
        dest: '<%= yeoman.dist %>/css',
        src: '**/*.css'
      }
    },

    htmlmin: {
      dist: {
        options: {
          //removeComments: true
          //collapseWhitespace: true
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: '*.html',
          dest: '<%= yeoman.dist %>'
        }]
      }
    },

    /*concat: {
      dist: {
        options: {
          process: true
        },
        files: {
          '<%= yeoman.dist %>/index.html': '<%= yeoman.dist %>/index.html'
        }
      }
    },*/
    /*uglify: {
      options: {
        sourceMap: '<%= yeoman.dist %>/js/main.map.js'
      },
      js: {
        src: '<%= yeoman.app %>/js/main.js',
        dest: '<%= yeoman.dist %>/js/main.js'
      }
    },*/
    jshint: {
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['<%= yeoman.app %>/js/*.js']
      }
    },
    compass: {
      dist: {
        options: {
          config: 'config.rb'
        }
      }
    },
    watch: {
      options: {
        nospawn: true
      },
      build_html: {
        files: [],
        tasks: []
      },
      build_js: {
        files: ['<%= yeoman.app %>js/**/*.js'],
        tasks: ['build_js']
      },
      build_css: {
        files: ['<%= yeoman.app %>/sass/**/*.sass'],
        tasks: ['build_css']
      },
      tests: {
        files: ['test/**/*'],
        tasks: ['qunit']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%= yeoman.dist %>/*.html',
          '<%= yeoman.dist %>/js/*.js',
          '<%= yeoman.dist %>/css/*.css',
          '<%= yeoman.dist %>/img/*'
        ]
      }
    },
    connect: {
      options: {
        port: 5000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, './dist')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },
    qunit: {
      all: ['test/**/*.html']
    },
    targethtml: {
      dist: {
        options: {
          curlyTags: {
            //https://github.com/changer/grunt-targethtml
            // usage eg: {{jsBaseURL}}/{{path}}/ or {{js}}/
            path: 'some/relative/path/to/static/assets',
            jsBaseURL: 'http://js.washingtonpost.com',
            cssBaseURL: 'http://css.washingtonpost.com',
            wwwBaseURL: 'http://www.washingtonpost.com',
            imgBaseURL: 'http://img.wpdigital.net',
            js: '<%= targethtml.dist.options.curlyTags.jsBaseURL %>/<%= targethtml.dist.options.curlyTags.path %>',
            css: '<%= targethtml.dist.options.curlyTags.cssBaseURL %>/<%= targethtml.dist.options.curlyTags.path %>',
            www: '<%= targethtml.dist.options.curlyTags.wwwBaseURL %>/<%= targethtml.dist.options.curlyTags.path %>',
            img: '<%= targethtml.dist.options.curlyTags.imgBaseURL %>/<%= targethtml.dist.options.curlyTags.path %>'
          }
        },
        files: {
          'dist/dfp.html': 'src/index.html'
        }
      },
      dev: {
        options: {
          curlyTags: {
            //https://github.com/changer/grunt-targethtml
            // usage eg: {{jsBaseURL}}/{{path}}/ or {{js}}/
            //js: '.',
            //css: '.',
            //www: '.',
            //img: '.'
          }
        },
        files: {
          'dist/index.html': 'src/index.html'
        }
      }
    },
    customBuild: {
      dev: {
        clickTracker: '',
        clickTrackerEsc: '',
        clickTag: 'http://www.example.com'
      },
      dfp: {
        clickTracker: '%%CLICK_URL_UNESC%%',
        clickTrackerEsc: '%%CLICK_URL_ESC%%',
        clickTag: '%%DEST_URL%%'
      }
    }
  });


  //USE CONCAT :dist and :dev with different processing functions for this
  grunt.registerMultiTask('customBuild', 'custom build', function(){
    //grunt.log.writeln(this.target + ': ' + this.data.clickTag);

    var template = grunt.file.read('dist/index.html');
    var output = grunt.template.process(template, {
      data: this.data
    });
    var filepath = 'dist/dfp.html';

    if(this.target === 'dev'){
      output = '<!doctype html>\n<html>\n<head>\n  <title>Test page</title>\n</head>\n<body>\n\n' +
        output +
        '\n\n</body>\n</html>';
      filepath = 'dist/index.html';
    }

    grunt.file.write(filepath, output);

  });

  //this works for non-optimised dfp version... this is step 1. step 2 is make dfp version from this.
  grunt.registerTask('default', [
    'clean:dist',
    'compass',
    'useminPrepare',
    'concat',
    'htmlmin',
    'cssmin',
    'uglify',
    'usemin'
    //i dont really like this... do another build from scratch for dfp template, making all built refs absolute, etc.
    //'customBuild:dfp',
    //'customBuild:dev'
  ]);

  //probably best to do a normal build and then a whole new dfp build... dirs: src, dist AND dfp?






  //grunt.registerTask('default', ['server']);
  //grunt.registerTask('min', [
    //'clean:dist',
    //'useminPrepare',
    //'concurrent:dist',
    //'autoprefixer',
    //'requirejs',
    //'concat',
    //'cssmin',
    //'compass',
    //'jshint',
    //'uglify',
    //'targethtml',
    //'htmlmin',
    //'copy',
    //'concat:dist',
    //'rev',
    //'usemin'
  //]);

  //grunt.registerTask('server', ['build', 'connect:livereload', 'open', 'watch']);
  //grunt.registerTask('build', ['build_css', 'build_js']);

  //grunt.registerTask('build_html', ['']);
  //grunt.registerTask('build_js', ['jshint', 'optimizer', 'uglify', 'qunit']);
  //grunt.registerTask('build_css', ['compass']);

  //grunt.registerTask('test', ['qunit']);

};
