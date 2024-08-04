const gulp = require('gulp');
const fs = require('fs-extra');
const path = require('path');
const through2 = require('through2');

const srcDir = path.resolve(__dirname, 'src');
const libDir = path.resolve(__dirname, 'lib');

function cleanLib(done) {
    console.log('Cleaning lib directory...');
    fs.removeSync(libDir);
    console.log('Lib directory cleaned.');
    done();
}

function copySrc(done) {
    console.log('Copying src to lib, excluding App.vue...');
    gulp.src([path.join(srcDir, '**/*'), `!${path.join(srcDir, 'App.vue')}`])
        .pipe(gulp.dest(libDir))
        .on('end', () => {
            console.log('Src directory copied to lib.');
            done();
        });
}

function renameVueToTsVue(done) {
    console.log('Renaming .vue files to .ts.vue...');
    const rename = dir => {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const fullPath = path.join(dir, file);
            console.log(`Processing file: ${fullPath}`);

            if (fs.statSync(fullPath).isDirectory()) {
                rename(fullPath);
            } else if (file.endsWith('.vue')) {
                const tsVueFilePath = fullPath.replace('.vue', '.vue');
                fs.renameSync(fullPath, tsVueFilePath);
                console.log(`Renamed ${fullPath} to ${tsVueFilePath}`);
            }
        });
    };

    rename(libDir);
    console.log('.vue files renamed to .ts.vue');
    done();
}

function updateImports(done) {
    console.log('Updating import statements...');
    gulp.src(path.join(libDir, '**/*.ts'))
        .pipe(replace(/(from\s+['"].*\/.*)(\.ts\.vue)(['"])/g, '$1.vue$3'))
        .pipe(gulp.dest(libDir))
        .on('end', () => {
            console.log('Import statements updated.');
            done();
        });
}

gulp.task('build', gulp.series(cleanLib, copySrc, renameVueToTsVue, updateImports));
