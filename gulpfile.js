var gulp = require('gulp'),
    del = require('del'),
    concat = require('gulp-concat'),
    concatCss = require('gulp-concat-css'),
    sass = require('gulp-sass');


gulp.task('js',function () {
    del('./build/js/**/*.js').then(function () {
        return gulp
            .src(['./src/js/angular.min.js','./src/js/angular-route.min.js','./src/js/angular-ui-router.min.js','./src/js/app.js'])
            .pipe(concat('app.js'))
            .pipe(gulp.dest('./build/js/'));
    });
});

gulp.task('sass',function () {
    del('./build/css/**/*.css').then(function () {
        return gulp
            .src('./src/scss/**/*.scss')
            .pipe(sass({outputStyle: 'compressed'}).on('error',sass.logError))
            .pipe(gulp.dest('./build/css/'));
    });
});