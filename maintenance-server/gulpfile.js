'use strict';

var gulp = require('gulp'),
	install = require('gulp-install');

var DEST = "./publish/";
var LIB_LOCATION = '../node_modules/local/**';
var LIB_OUT = DEST + 'node_modules/local'

var CODE_LOCATION = [
	"./app/**",
	"!./app/config.js"];

gulp.task('publish', ['copy-lib','copy-code','copy-package'], function () {

});

gulp.task('copy-lib', function () {
	return gulp.src(LIB_LOCATION)
		.pipe(gulp.dest(LIB_OUT));
});

gulp.task('copy-code', function () {
	return gulp.src(CODE_LOCATION)
		.pipe(gulp.dest(DEST));
});
gulp.task('copy-package', function () {
	return (gulp.src('./package.json'))
		.pipe(install())
		.pipe(gulp.dest(DEST));
});


gulp.task('run', function () {
    process.chdir('/app');
    require('server.js');
});
