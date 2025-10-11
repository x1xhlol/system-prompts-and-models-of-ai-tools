var gulp = require('gulp');
var plugin = require('gulp-load-plugins')();
var fs = require('fs');
var exec = require('child_process').exec;
var argv = require('minimist')(process.argv.slice(2));

var path = {
    rootdir: './',
    lib: ['./lib/**/*.js'],
    libdir: './lib/',
    test: ['./test/**/*.js'],
    testdir: './test/',
    build: ['package.json', 'component.json', 'bower.json', 'README.md', 'speakingurl.min.js'],
    json: ['package.json', 'component.json', 'bower.json'],
    readme: './README.md',

    target: './speakingurl.min.js'
};

var banner = ['/**',
    ' * <%= pkg.name %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.licenses[0].type %>',
    ' * @author <%= pkg.author.name %>',
    ' */'
].join('\n');

gulp.task('beautify', function (done) {

    gulp.src(path.lib)
        .pipe(plugin.jsbeautifier({
            config: '.jsbeautifyrc',
            mode: 'VERIFY_AND_WRITE'
        }))
        .pipe(gulp.dest(path.libdir));

    gulp.src(path.test)
        .pipe(plugin.jsbeautifier({
            config: '.jsbeautifyrc',
            mode: 'VERIFY_AND_WRITE'
        }))
        .pipe(gulp.dest(path.testdir));

    gulp.src(path.json)
        .pipe(plugin.jsbeautifier({
            config: '.jsbeautifyrc',
            mode: 'VERIFY_AND_WRITE'
        }))
        .pipe(gulp.dest(path.rootdir));

    done();
});

gulp.task('test', function () {

    return gulp.src(path.test, {
            read: false
        })
        .pipe(plugin.mocha({
            reporter: 'spec',
            globals: {
                should: require('should')
            }
        }));
});

gulp.task('jshint', ['beautify'], function () {

    return gulp.src(path.lib, path.json)
        .pipe(plugin.jshint('.jshintrc'), {
            verbose: true
        })
        .pipe(plugin.jshint.reporter('jshint-stylish'));
});

gulp.task('uglify', ['jshint'], function (done) {

    var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

    return gulp.src(path.lib)
        .pipe(plugin.uglify())
        .pipe(plugin.header(banner, {
            pkg: pkg
        }))
        .pipe(plugin.rename(path.target))
        .pipe(gulp.dest(path.rootdir));
});

gulp.task('bumpup', ['bumpup-version'], function () {

    var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

    // insert newsest version
    return gulp.src(path.readme)
        .pipe(plugin.replace(
            /cdnjs.cloudflare.com\/ajax\/libs\/speakingurl\/\d{1,1}\.\d{1,2}\.\d{1,2}\/speakingurl.min.js/g,
            'cdnjs.cloudflare.com/ajax/libs/speakingurl/' + pkg.version + '/speakingurl.min.js'))
        .pipe(plugin.replace(
            /cdn.jsdelivr.net\/speakingurl\/\d{1,1}\.\d{1,2}\.\d{1,2}\/speakingurl.min.js/g,
            'cdn.jsdelivr.net/speakingurl/' + pkg.version + '/speakingurl.min.js'))
        .pipe(gulp.dest(path.rootdir));
});

gulp.task('bumpup-version', function () {

    return gulp.src(path.json)
        .pipe(plugin.bump({
            type: argv.major ? 'major' : (argv.minor ? 'minor' : 'patch')
        }))
        .pipe(gulp.dest(path.rootdir));
});

gulp.task('release', function (done) {

    var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    var tag = 'v' + pkg.version;
    var message = 'Release ' + tag;
    var execute = [
        'npm rm speakingurl -g',
        'npm install . -g',
        'git add .',
        'git commit -m "Release ' + tag + '"',
        'git tag ' + tag + ' -m "Release ' + tag + '"',
        'git push -u origin master',
        'git push -u origin master --tags',
        'npm publish'
    ].join('\n');

    exec(execute, done());
});

gulp.task('watch', function () {
    gulp.watch([path.json, path.lib], ['jshint', 'test']);
});

gulp.task('default', ['test', 'jshint', 'uglify']);
