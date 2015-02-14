var gulp = require('gulp')
var to5 = require('gulp-6to5')
var umd = require('gulp-umd')
var concat = require('gulp-concat')
var uglify = require('gulp-uglify')

gulp.task('6to5', function() {
    gulp.src('src/promise-xhr.js')
        .pipe(to5({ modules: 'ignore' }))
        .pipe(umd({
            exports: function() { return 'xhr' },
            namespace: function() { return 'PromiseXHR' }
        }))
        .pipe(gulp.dest('.'))
})

gulp.task('uglify', function() {
    gulp.src('promise-xhr.js')
        .pipe(uglify())
        .pipe(concat('promise-xhr.min.js'))
        .pipe(gulp.dest('.'))
})

gulp.task('default', ['build'])
gulp.task('build', ['6to5', 'uglify'])
