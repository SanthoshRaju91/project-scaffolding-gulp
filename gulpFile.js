/**
* gulpFile.js
* Gulp task runners for minimizing, concatenating, JS lint, SASS compiler, generating CSS and JS files for production build
* Also, for development we have a browser-sync watcher to aid the development process.
*/

//require necessary modules
var gulp = require('gulp');
var jshint = require('gulp-jshint'); //JS hint
var autoprefixer = require('gulp-autoprefixer'); // CSS auto prefixer
var imagemin = require('gulp-imagemin'); // Image optimizer
var open = require('gulp-open');
var os = require('os');
var sass = require('gulp-sass'); // SASS compiler
var concat = require('gulp-concat'); //Concatinating files
var minifyCSS = require('gulp-clean-css'); // CSS minifier
var minifyJS = require('gulp-uglify'); // JS minifier
var livereload = require('gulp-livereload'); // livereload for DEV only
var preprocessor = require('gulp-preprocess') // preprocessor only for HTML.
var del = require('del');
var rename = require('gulp-rename');
var csslint = require('gulp-csslint');
var bower = require('gulp-bower-files');

//configuring environment
var environment = process.env.ENV || 'development';

/*
* Configuring the CSS and JS scripts path for both Production and development
* For production - it will be in the build folder.
* For development - it will be in the public folder with livereload running.
*/

var BUILD_PATH = {
  cssPath: "./build/css/",
  jsPath: "./build/js/",
  imgsPath: "./build/imgs/",
  templatePath: "./build/templates/",
  htmlPath: './build/',
  vendorPath: './build/vendor/'
};

var PUBLIC_PATH = {
  sassPath: "./public/styles/**/*.scss",
  cssOutPath: './public/css/style.css',
  cssInPath: './public/css/',
  jsPath: "./public/js/**/*.js",
  imgsPath: "./public/imgs/**/*.*",
  templatePath: "./public/templates/*.html",
  htmlPath: "./public/*.html",
  vendorPath: './public/vendor/**/*.*'
};

/**
CSS: styles gulp task
*/
gulp.task('styles', function() {
  if(environment == 'production') {
    return gulp.src(PUBLIC_PATH.cssOutPath)
      .pipe(csslint())
      .pipe(csslint.reporter())
      .pipe(concat('build.css'))
      .pipe(autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      }))
      .pipe(rename('style.min.css'))
      .pipe(minifyCSS({compatibility: 'ie8'}))
      .pipe(gulp.dest(BUILD_PATH.cssPath));
  } else {
    return gulp.src(PUBLIC_PATH.sassPath)
      .pipe(sass().on('error', sass.logError))
      .pipe(csslint())
      .pipe(csslint.reporter())
      .pipe(rename('style.css'))
      .pipe(gulp.dest(PUBLIC_PATH.cssInPath))
      .pipe(livereload());
  }
});

/**
JS: scripts gulp task
*/
gulp.task('scripts', function() {
  if(environment == 'production') {
    return gulp.src(PUBLIC_PATH.jsPath)
      .pipe(concat('build.js'))
      .pipe(rename('build.min.js'))
      .pipe(minifyJS())
      .pipe(gulp.dest(BUILD_PATH.jsPath));
  } else {
    return gulp.src(PUBLIC_PATH.jsPath)
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(livereload());
  }
});

/**
IMG: images gulp task
*/
gulp.task('images', function() {
  if(environment == 'production') {
    return gulp.src(PUBLIC_PATH.imgsPath)
      .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}]
      }))
      .pipe(gulp.dest(BUILD_PATH.imgsPath));
  }
});

/**
HTML: html gulp task, only for index.html where the file should be preprocessed for production and dev builds
*/
gulp.task('html', function() {
  if(environment == 'production') {
    return gulp.src(PUBLIC_PATH.htmlPath)
      .pipe(preprocessor({context: {NODE_ENV: 'production', DEBUG: true}}))
      .pipe(gulp.dest(BUILD_PATH.htmlPath));
  } else {
    return gulp.src(PUBLIC_PATH.htmlPath)
      .pipe(livereload());
  }
});

/**
TEMPLATES: templates gulp task.
*/
gulp.task('template', function() {
  if(environment == 'production') {
    return gulp.src(PUBLIC_PATH.templatePath)
      .pipe(gulp.dest(BUILD_PATH.templatePath));
  } else {
    return gulp.src(PUBLIC_PATH.templatePath)
      .pipe(livereload());
  }
});


/**
*GULP: vendor - to download bower dependencies from bower.json file and move it to build folder
*/
gulp.task('vendor', function() {
  if(environment == 'production') {
    return gulp.src(PUBLIC_PATH.vendorPath)
     .pipe(gulp.dest(BUILD_PATH.vendorPath));
  }
});

/**
WATCH: watch gulp task only for development environment with livereload
*/
gulp.task('watch', function() {
  require('./server.js');
  livereload.listen();
  gulp.watch(PUBLIC_PATH.sassPath, ['styles']); // Watch for sass file changes
  gulp.watch(PUBLIC_PATH.jsPath, ['scripts']); // Watch for js files changes
  gulp.watch(PUBLIC_PATH.htmlPath, ['html']); // Watch for html file changes
  gulp.watch(PUBLIC_PATH.templatePath, ['template']); // Watch for HTML templates file changes
  gulp.watch(PUBLIC_PATH.imgsPath, ['images']); // Watch for image file changes
});

/**
GULP: prod:build - production build task
*/
gulp.task('prod:build', ['styles', 'scripts', 'html', 'template', 'images', 'vendor']);

/**
GULP: open in default browser,  checks for default browser on the host machine
*/
const platform = os.platform();
var browser = platform === 'linux' ? 'google-chrome': (platform === 'darwin' ? 'google chrome': (platform === 'win32' ? 'chrome' : 'firefox'));

gulp.task('open', function() {
  var options = {
    uri: 'http://localhost:3000',
    app: browser
  };
  gulp.src(__filename)
    .pipe(open(options));
});

/**
* GULP: clean - to clean the build folder completely before the production build.
* Back up will be taken before cleaning the build.
*/
gulp.task('clean', function() {
  del([
    './build'
  ]);
});

/**
GULP: default task - only for development environment
*/
gulp.task('default', ['watch', 'open']);

/**
GULP: build task - for production environment for build purpose only
*/
gulp.task('build', ['prod:build']);
