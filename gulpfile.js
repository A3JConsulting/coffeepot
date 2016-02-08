var gulp = require("gulp");

gulp.src("./src/app/**/*")
.pipe(gulp.dest(__dirname+"/bin/Electron.app/Contents/Resources/app/"));

gulp.task("watch", function() {
  gulp.watch("./src/app/**/*", ["copy"]);
});

gulp.task("copy", function() {
  gulp.src("./src/app/**/*")
  .pipe(gulp.dest(__dirname+"/bin/Electron.app/Contents/Resources/app/"));
});

gulp.task("default", ["watch"]);
