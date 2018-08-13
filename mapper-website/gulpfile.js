'use strict';

var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	changed = require('gulp-changed'),
	browserify = require('browserify'),
	watchify = require('watchify'),
	vinyl = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	gulpif = require('gulp-if'),
	streamify = require('gulp-streamify'),
	runSequence = require('run-sequence'),
	express = require('express'),
	replace = require('gulp-replace'),
	bump = require('gulp-bump'),
	shell = require('gulp-shell');
	
var sourcemaps = require('gulp-sourcemaps');

var sys = require('sys')
var exec = require('child_process').exec;
function puts(error, stdout, stderr) {sys.puts(stdout);sys.puts(stderr);}

/**
 * Useful tasks:
 * - build-debug
 *   - builds and outputs to debug directory
 *   - no minification, etc
 * - build
 *   - builds and outputs to dist directory.
 *   - minification
 *   - doesn't copy config.js
 * - watch
 *   - builds in debug mode
 *   - auto rebuilds when files change
 */
	
// output constants
var INDEX_SRC = 'app/index.html'
var STATIC_SRC = [
	'app/**',
	'!app/js/**',
	'!app/index.html'
];
var DEBUG_DEST = './debug'
var DIST_DEST = './dist'
var DEPLOY_TARGET = '../published/shdwc-route-finder/'
var PORT = 2050;

var debug = true;
var watch = false;
var endless = false;

gulp.task('deploy', /*['publish'],*/ function (cb) {
	var src = DIST_DEST + "/**";
	var dest = DEPLOY_TARGET;
	
	var commitMsg = "commit";
	
	var loc = " --git-dir=" + dest + ".git --work-tree=" + dest + " ";
	var add = "git " + loc + " add .";
	var commit = "git " + loc + " commit -m '" + commitMsg + "'";
	exec(add,puts);
	exec(commit,puts);
	
	// console.log(loc);
	// gulp.src(src)
		// .pipe(gulp.dest(dest))
		// .on('finish',function() {
			// exec("git " + loc + " add .",puts);
			// cb();
		// });
});

gulp.task('run-local', function (cb) {
	cb();
	
	endless = true;
	runSequence('express', 'watch', 'watch-static', function () {
		console.log("\n\n");
		console.log("Web server running on port " + PORT);
	});
});

gulp.task('run-local-dist', function (cb) {
	runSequence('express-dist', function () {
		console.log("\n\n");
		console.log("Web server running on port " + PORT);
	});	
});

gulp.task('build-debug', function (cb) {
	debug = true;
	runSequence(['browserify','copy-static'],cb);
});

gulp.task('build', function (cb) {
	debug = false;
	runSequence(['browserify','copy-static'],cb);
});

gulp.task('publish', function (cb) {
	runSequence(
		'bump', 
		'build', 
		cb);
});

gulp.task('watch', function (cb) {
	watch = true;
	runSequence('build-debug',function () {
		cb();
		console.log("Watching for javascript changes.");
	});
});

gulp.task('bump', function () {
	return gulp.src('./package.json')
		.pipe(bump())
		.pipe(gulp.dest('./'))
});

gulp.task('express', function (cb) {
	var app = express();
	app.use(express.static(DEBUG_DEST));
	app.listen(PORT);
	cb();
});

gulp.task('express-dist', function (cb) {
	var app = express();
	app.use(express.static(DIST_DEST));
	app.listen(PORT);
	cb();
});

gulp.task('browserify-third-party', function () {
	var dest = (debug ? DEBUG_DEST : DIST_DEST) + "/js";
	
	var b = browserify({
		cache: {},
		packageCache: {},
		debug: debug
	});
	b.add('./app/js/third-party/index.js')
	b.bundle()
		.pipe(vinyl('bundle-lib.js'))
		.pipe(gulpif(!debug, streamify(uglify())))
		.pipe(gulp.dest(dest));	
});

gulp.task('browserify', ['browserify-third-party'], function () {
	var dest = (debug ? DEBUG_DEST : DIST_DEST) + "/js";

	var b = browserify({
		debug: debug,
		cache: {},
		packageCache: {},
	});
	b.add('./app/js/app.js')
	
	if (watch) {
		b = watchify(b);
		b.on('update',function () {
			var time = Date.now()
			console.log("Rebuilding bundle.js...");
			browserifyGo(b, dest)
				.on('end',function () {
					var newTime = Date.now()
					var diff = (newTime - time) / 1000;
					console.log("done. " + diff.toFixed(1) + "s")
				});
		});
	}
	
	return browserifyGo(b, dest);
});

function browserifyGo(b, dest) {
	return b.bundle()
		.on('error', function (err) {
			console.log("Error building browserify bundle.")
			console.error(err.message);
		})
		.pipe(vinyl('bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(gulpif(!debug, streamify(uglify())))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dest));
};

gulp.task('watch-static', function () {
	gulp.watch(STATIC_SRC, ['copy-static']);
	gulp.watch(INDEX_SRC, ['copy-static']);
});

gulp.task('copy-static', function () {
	var dest = debug ? DEBUG_DEST : DIST_DEST;

	gulp.start('copy-index');
	
	var src = STATIC_SRC.slice(0);
	if (!debug)
		src.push('!app/config.js')
	
	return gulp.src(src)
		.pipe(gulp.dest(dest));
});

gulp.task('copy-index', function () {
	var dest = debug ? DEBUG_DEST : DIST_DEST;	
	var version = require('./package.json').version;
	
	return gulp.src(INDEX_SRC)
		.pipe(replace('$version', version))
		.pipe(gulp.dest(dest));
})
