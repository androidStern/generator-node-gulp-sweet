'use strict';

var chalk = require('chalk');
var util = require('util');
var path = require('path');
var npmName = require('npm-name');
var npmLatest = require('npm-latest');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var Config = require('../config');

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.settings = new Config();
    this.testFramework = this.options['test-framework'] || 'mocha';
    this.jscsModule = true;
    this.releaseModule = true;
    this.istanbulModule = true;
    this.coverallsModule = true;
  },

  prompting: function () {
    var cb = this.async();
    var log = this.log;

    log(yosay('Hello, and welcome to the node-gulp-sweet generator. Let\'s be awesome together!'));

    var prompts = [{
      name: 'name',
      message: 'Module Name',
      default: path.basename(process.cwd()),
      filter: function (input) {
        var done = this.async();

        npmName(input, function (err, available) {
          if (!available) {
            log.info(chalk.yellow(input) + ' already exists on npm. You might want to use another name.');
          }

          done(input);
        });
      }
    }];

    this.currentYear = new Date().getFullYear();
    this.currentDate = new Date().toISOString().slice(0,10); // YYY-MM-DD

    // Write settings default values back to prompt
    var meta = this.settings.getMeta();
    prompts.forEach(function (val) {
      if (meta[val.name]) {
        val.default = meta[val.name];
      }
    }.bind(this));

    this.prompt(prompts, function (props) {
      this.slugname = this._.slugify(props.name);
      this.safeSlugname = this.slugname.replace(
          /-+([a-zA-Z0-9])/g,
          function (g) {
            return g[1].toUpperCase();
          }
      );
      
      props.license = 'MIT';
      props.authorName = "Andrew Stern";
      props.authorEmail = "andrew.martin.stern@gmail.com";
      props.githubUsername = "androidStern";
      this.settings.setMeta(props);
      this.repoUrl = 'https://github.com/' + props.githubUsername + '/' + this.slugname;
      props.homepage = this.repoUrl;
      this.props = props;
      cb();
    }.bind(this));

  },

  dependency: function dependency() {
    this.dependencies = '';
    if (this.dependencies.length > 0) {
      this.dependencies = this.dependencies.replace('\n', '');
      this.dependencies = this.dependencies.substring(0, this.dependencies.length - 1);
    }
  },

  copyfiles: function () {
    this.copy('jshintrc', '.jshintrc');
    this.copy('_gitignore', '.gitignore');
    this.copy('_travis.yml', '.travis.yml');
    this.copy('editorconfig', '.editorconfig');
    if (this.jscsModule) {
      this.copy('.jscsrc', '.jscsrc');
    }

    this.template('_README.md', 'README.md');
    this.template('_CHANGELOG.md', 'CHANGELOG.md');
    this.template('_gulpfile.js', 'gulpfile.js');
    this.template('_package.json', 'package.json');
  },

  writing: function () {
    this.mkdir('lib');
    this.template('lib/name.js', 'lib/' + this.slugname + '.js');

    this.mkdir('test');
    this.template('test/name_test.js', 'test/' + this.slugname + '_test.js');

    this.mkdir('example');
    this.template('example/simple.js', 'example/simple.js');

    this.mkdir('build');
  },

  install: function () {
    this.installDependencies({
      bower: false,
      skipInstall: this.options['skip-install']
    });
  }
});
