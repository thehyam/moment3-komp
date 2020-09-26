//Defining varibles
const { src, dest, watch, series, parallel} = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');

//Search paths

const files = {
    htmlPath: "src/**/*.html",
    cssPath: "src/**/*.css",
    jsPath: "src/**/*.js",
    imgPath: "src/images/*",
    scssPath: "src/**/*.scss"
}

//Copy HTML-files

function copyHTML() {
    return src(files.htmlPath)
    .pipe(htmlmin({ removeComments: true }))
    .pipe(dest('pub')
    );
}

 //Concat and minify js files  
function jsTask() {
    return src(files.jsPath)
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('/.'))
    .pipe(dest('pub/js')
    );
}

// Compile scss into css
function sassTask () {
    // return the css
    return src(files.scssPath)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({cascade: false}))
    .pipe(sourcemaps.write('/.'))
    .pipe(dest('pub'))
   .pipe(browserSync.stream());
}

//Concat and minify CSS files
function cssTask() {
    return src(files.cssPath)
    .pipe(sourcemaps.init())
    .pipe(concat('style.css'))
    .pipe(autoprefixer({cascade: false}))
    .pipe(cleanCSS({debug: true}, (details) => {
        console.log(`${details.name}: ${details.stats.originalSize}`);
        console.log(`${details.name}: ${details.stats.minifiedSize}`);
      }))
    .pipe(sourcemaps.write('/.'))
    .pipe(dest('pub/css')
    );

}

// Adding images and compressing them 
function imgTask() {
    return src(files.imgPath)
    .pipe(imagemin())
    .pipe(dest('pub/images')
    );
}


//Watch task for all other tasks
function watchTask() {

    //BowserSync function (also defined in each task)
    browserSync.init({
        injectChanges: false,
        server: {
            baseDir: './pub'
        }
    });
   
    watch([files.htmlPath, files.jsPath, files.imgPath], 
        parallel(copyHTML, jsTask, imgTask)).on('change', browserSync.reload);
    watch(files.cssPath, cssTask).on('change', browserSync.reload);    
    watch(files.scssPath, sassTask); 

    
}

//default task
exports.default = series(
    parallel(copyHTML, jsTask, imgTask, sassTask),
    cssTask,
    watchTask
);

