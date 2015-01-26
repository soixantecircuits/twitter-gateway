Router.configure({
   layoutTemplate: 'layout',
   yieldTemplate: {
      header: {
         to: 'header'
      },
      footer: {
         to: 'footer'
      }
   }
});

Router.route('/', function () {
  this.render('home');
});
Router.route('/bots', function(){
  this.render('bots');
});
Router.route('/options', function () {
  this.render('options');
});