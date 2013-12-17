var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

var cheerio = require('cheerio');
var sys = require('sys');
var exec = require('child_process').exec;

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // display time to complete tasks:
  require('time-grunt')(grunt);

  var yeomanConfig = {
    app: 'src',
    dist: 'dist'
  };

  grunt.initConfig({
    yeoman: yeomanConfig,
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '<%%= yeoman.dist %>/*',
            '!<%%= yeoman.dist %>/.git*'
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
        dest: '<%%= yeoman.dist %>'
      },
      html: '<%%= yeoman.app %>/index.html'
    },
    usemin: {
      options: {
        dirs: ['<%%= yeoman.dist %>']
      },
      html: ['<%%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%%= yeoman.dist %>/css/{,*/}*.css']
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%%= yeoman.app %>',
          dest: '<%%= yeoman.dist %>',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'img/{,*/}*.{webp,gif}',
            'css/fonts/*',
            'js/main.js'
          ]
        }]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%%= yeoman.app %>/css',
        dest: '<%%= yeoman.dist %>/css',
        src: '**/*.css'
      }
    },
    concat: {
      dist: {
        options: {
          banner: '<!-- AD ID: %eaid! -->' +
            ('<%= bug_id %>' ? '\n<!-- BUG ID: <%= bug_id %> -->' : '') +
            '\n<!-- <%= width %>x<%= height %> | <%= advertiser %> - <%= name %> -->' +
            '\n\n',
          process: {
            data: {
              clickTracker: '%%CLICK_URL_UNESC%%',
              clickTrackerEsc: '%%CLICK_URL_ESC%%',
              clickTag: '%%DEST_URL%%'
            }
          }
        },
        files: {
          '<%%= yeoman.dist %>/dfp.html': '<%%= yeoman.dist %>/index.html'
        }
      },
      dev: {
        options: {
          banner: '<!DOCTYPE html>\n<html>\n<head>\n  <title><%%= pkg.name %>: Test Page</title>\n</head>\n<body>\n\n',
          footer: '\n\n</body>\n</html>',
          process: {
            data: {
              clickTracker: '',
              clickTrackerEsc: '',
              clickTag: 'http://www.example.com'
            }
          }
        },
        files: {
          '<%%= yeoman.dist %>/index.html': '<%%= yeoman.dist %>/index.html'
        }
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
          cwd: '<%%= yeoman.app %>',
          src: '*.html',
          dest: '<%%= yeoman.dist %>'
        }]
      }
    },
    rev: {
      options: {
        encoding: 'utf8',
        algorithm: 'md5',
        length: 8
      },
      dist: {
        files: [{
          src: [
            '<%%= yeoman.dist %>/js/main.min.js',
            '<%%= yeoman.dist %>/css/style.min.css'
          ]
        }]
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= yeoman.app %>/',
          src: ['**/*.{png,jpg,gif}'],
          dest: '<%%= yeoman.dist %>/'
        }]
      }
    },
    jshint: {
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['<%%= yeoman.app %>/js/*.js']
      }
    },
    uglify: {
      options: {
        banner: '/* Built <%%= grunt.template.today("mm-dd-yyyy") %> */\n'
      }//,
      /* Uncomment if not using usemin task */
      //dist: {
      //  files: {
      //    '<%%= yeoman.dist %>/js/main.min.js': ['<%%= yeoman.app %>/js/lib/Modernizr.min.js', '<%%= yeoman.app %>/js/main.js']
      //  }
      //}
    },
    compass: {
      dist: {
        options: {
          config: 'config.rb'
        }
      }
    },
    /* Uncomment if not using usemin task */
    cssmin: {
      options: {
        banner: '/* Built <%%= grunt.template.today("mm-dd-yyyy") %> */',
        report: 'gzip'
      }
    //  ,dist: {
    //    files: {
    //      '<%%= yeoman.dist %>/css/style.min.css': ['<%%= yeoman.app %>/css/style.css']
    //    }
    //  }
    },
    concurrent: {
      dist: [
        'jshint:src',
        'compass:dist',
        'imagemin:dist'
      ]
    },
    watch: {
      options: {
        nospawn: true
      },
      build_html: {
        files: ['<%%= yeoman.app %>/**/*.html'],
        tasks: ['build']
      },
      build_js: {
        files: ['<%%= yeoman.app %>/js/**/*.js'],
        tasks: ['build']
      },
      build_css: {
        files: ['<%%= yeoman.app %>/sass/**/*.sass'],
        tasks: ['build']
      },
      tests: {
        files: ['test/**/*'],
        tasks: ['test']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '<%%= yeoman.dist %>/**/*'
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
        path: 'http://localhost:<%%= connect.options.port %>'
      }
    },
    qunit: {
      all: ['test/**/*.html']
    },
    absolute: {
      dist: {
        src: '<%%= yeoman.dist %>/dfp.html',
        path: '<%= abs_path %>',
        www: 'http://www.washingtonpost.com',
        css: 'http://css.washingtonpost.com',
        img: 'http://img.wpdigital.net',
        js: 'http://js.washingtonpost.com'
      }
    }
  });

  grunt.registerMultiTask('absolute', 'Make URLs absolute', function(){

    grunt.log.write('Transforming relative URL\'s --> absolute URL\'s for: ' + this.data.src);

    var data = this.data;
    var src = data.src;
    var defaultBase = 'http://www.washingtonpost.com';
    var path = data.path.replace(/^\//, '').replace(/\/$/, '');
    var urls = {
      www: (data.www ? data.www.replace(/\/$/, '') : defaultBase) + '/' + path,
      img: (data.img ? data.img.replace(/\/$/, '') : defaultBase) + '/' + path,
      js: (data.js ? data.js.replace(/\/$/, '') : defaultBase) + '/' + path,
      css: (data.css ? data.css.replace(/\/$/, '') : defaultBase) + '/' + path
    };

    var $ = cheerio.load(grunt.file.read(data.src));


    $('script').each(function(){
      var src = $(this).attr('src'), newSrc;
      if(src && !/^http|^\/\/\:/.test(src)){
        newSrc = urls.js + '/' + src.replace(/^\//, '');
        $(this).attr('src', newSrc);
      }
    });

    $('img').each(function(){
      var src = $(this).attr('src'), newSrc;
      if(src && !/^http|^\/\/\:/.test(src)){
        newSrc = urls.img + '/' + src.replace(/^\//, '');
        $(this).attr('src', newSrc);
      }
    });

    $('link').each(function(){
      var href = $(this).attr('href'), newHref;
      if(href && !/^http|^\/\/\:/.test(href)){
        newHref = urls.css + '/' + href.replace(/^\//, '');
        $(this).attr('href', newHref);
      }
    });

    //remove testing elements:
    $('.dev-element').remove();

    grunt.file.write(data.src, $.html());
  })

  grunt.registerTask('default', ['jshint:src', 'build', 'serve']);

  grunt.registerTask('test', ['qunit']);

  grunt.registerTask('build', [
    'clean:dist',
    'concurrent:dist',
    'useminPrepare',
    'concat',
    'uglify',
    'cssmin',
    'htmlmin',
    'copy:dist',
    'rev:dist',
    'usemin',
    'concat:dist',
    'concat:dev',
    'absolute:dist'
  ]);

  grunt.registerTask('serve', [
    'connect:livereload',
    'open',
    'watch'
  ]);

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

};
