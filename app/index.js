var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var AdGenerator = module.exports = function AdGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(AdGenerator, yeoman.generators.Base);

AdGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var prompts = [
    {
      name: 'name',
      message: 'Please enter a name for this ad unit.',
      default: 'Ad Unit'
    }, {
      name: 'width',
      message: 'What is the width of this ad unit?',
      default: '336'
    }, {
      name: 'height',
      message: 'What is the height of this ad unit?',
      default: '850'
    }, {
      name: 'namespace',
      message: 'What wpAd namespace would you like to wrap your JS in?',
      default: 'myUniqueNamespace'
    }, {
      name: 'abs_path',
      message: 'Please enter a path for where this will live on the live server?',
      default: '/wp-adv/advertisers/myUnit/'
    }, {
      name: 'advertiser',
      message: 'Who is the advertiser (optional)?'
    }, {
      name: 'bug_id',
      message: 'What is the bug id (optional)?'
    }, {
      name: 'test_kw',
      message: 'what is the test_kw (optional)?'
    }
  ];

  this.prompt(prompts, function (props) {

    //store all prompts
    for(var key in props){
      if(props.hasOwnProperty(key) && !this[key]){
        this[key] = props[key];
      }
    }

    cb();
  }.bind(this));
};

AdGenerator.prototype.app = function app() {
  this.mkdir('src');
  this.mkdir('src/js');
  this.mkdir('src/js/lib');
  this.mkdir('src/sass');
  this.mkdir('src/img');
  this.mkdir('src/test');
};

AdGenerator.prototype.templatefiles = function projectfiles() {
  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');
  this.template('_Gruntfile.js', 'Gruntfile.js');
  this.template('src/_index.html', 'src/index.html');
  this.template('src/js/_main.js', 'src/js/main.js');
  this.template('src/sass/_style.sass', 'src/sass/style.sass');
}

AdGenerator.prototype.projectfiles = function projectfiles() {
  //this.copy('Gruntfile.js', 'Gruntfile.js');
  this.copy('config.rb', 'config.rb');
  this.copy('bowerrc', '.bowerrc');
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
};
