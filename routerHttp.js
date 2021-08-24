
// Router HTTP / HTTPS
let mobile = require('is-mobile');
let bank   = require('./routes/bank');
module.exports = function(app, redT) {
	// Home
	app.get('/', function(req, res) {
		
		//return res.redirect('/playgame/');
		 if (mobile({ua:req})){
			 return res.redirect('/mobile/');
		 } else {
			 return res.redirect('/playgame/');
		 }
	});
	app.get('/playgame/', function(req, res) {
		//return res.render('index');
		 if (mobile({ua:req})){
			return res.redirect('/mobile/');
		} else {
			return res.render('index');
		} 
	});
	app.get('/mobile/', function(req, res) {
		if (mobile({ua:req})){
			return res.render('index_mobile');
		} else {
			return res.redirect('/playgame/');
		}
	});

	// Android
	app.get('/download/android', function(req, res) {
		return res.render('download/android');
	});

	// Admin
	app.get('/68ClubA/', function(req, res) {
		return res.render('admin');
	});
	
	// Admin
	app.get('/dungabcxyz/', function(req, res) {
		return res.render('dungabcxyz');
	});

	// Fanpage
	app.get('/fanpage/', function(req, res) {
		return require('./routes/fanpage/redirect')(res);
	});

	// Help IOS
	app.get('/help/ios/', function(req, res) {
		return res.render('help/ios');
	});

	//Telegram
	app.get('/telegram/', function(req, res) {
		return require('./routes/telegram/redirect')(res);
	});
	
	// thesieutoc callback
	app.post('/1ed926d2f8cf228c75cc370d25d28910/tst_callback', function(req, res) {
        return require('./app/Controllers/shop/nap_the_callback')(req,res);
    });


	// Bank
	app.get('/bank/', function(req, res) {
		bank(res, req.query);
	});

	// Sign API
	require('./routes/api')(app, redT);  // load routes API
};
