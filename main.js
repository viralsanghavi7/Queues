var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
var app1 = express()
var http = require('http')
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({});




client.lpush("servers", "http://127.0.0.1:3000")
client.lpush("servers", "http://127.0.0.1:3001")



app.use(function(req, res, next) 
{
	console.log(req.method, req.url);

	client.lpush("recent_urls",req.url);
	client.ltrim("recent_urls", 0,4);

	next(); // Passing the request to the next handler in the stack.
});


app.get('/get', function(req, res) {
	console.log("get called")
	client.get("key", function(err,value){ res.send(value)});
});

app.get('/set', function(req, res) {
	console.log("set called")
	client.set("key", "this message will self-destruct in 10 seconds");
});



app.get('/recent', function(req, res) {
	client.lrange("recent_urls", 0,4, function(err,value){ res.send(value)});
});

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.



app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		client.lpush("images",img)
	  		console.log("Image posted");
		});
	}

   res.status(204).end()
}]);

app.get('/meow', function(req, res) {
	{
		//if (err) throw err
		res.writeHead(200, {'content-type':'text/html'});

		
		client.lrange("images",0,0, function(err, image){
			image.forEach(function(pic){
					res.write("<h1>\n<img src='data:meow.jpg;base64,"+pic+"'/>");
			})
			res.end();
		})	

		client.ltrim("images",1,-1)
   		
	}
})




/*
app1.get('/get', function(req, res) {
	client.get("key", function(err,value){ res.send(value)});
});

app1.get('/set', function(req, res) {
	client.set("key", "this message will self-destruct in 10 seconds");
	//client.expire('key', 1);
});



app1.get('/recent', function(req, res) {
	client.lrange("recent_urls", 0,4, function(err,value){ res.send(value)});
});

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app1.use(function(req, res, next) 
{
	console.log(req.method, req.url);

	client.lpush("recent_urls",req.url);
	client.ltrim("recent_urls", 0,4);

	next(); // Passing the request to the next handler in the stack.
});


app1.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files

   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		client.lpush("images",img)
	  		console.log("Image posted");
		});
	}

   res.status(204).end()
}]);

app1.get('/meow', function(req, res) {
	{
		//if (err) throw err
		res.writeHead(200, {'content-type':'text/html'});

		
		client.lrange("images",0,0, function(err, image){
			image.forEach(function(pic){
					res.write("<h1>\n<img src='data:meow.jpg;base64,"+pic+"'/>");
			})
			res.end();
		})	

		client.ltrim("images",1,-1)
   		
	}
})
*/
// HTTP SERVER
 var server = app.listen(3000, function () {

   var host = server.address().address
   var port = server.address().port

   console.log('Example app listening at http://%s:%s', host, port)
 })


/*
// HTTP SERVER
 var server1 = app1.listen(3001, function () {

   var host = server1.address().address
   var port = server1.address().port

   console.log('Example app1 listening at http://%s:%s', host, port)
 })




var balancer = http.createServer(function(req, res) {
	client.rpoplpush("servers","servers",function(err,source){
			proxy.web(req, res, { target: source });
	})
    
}).listen(3002);
*/
app.get('/', function(req, res) {
  res.send('hello world')
})



/*app1.get('/', function(req, res) {
  res.send('hello world from second app')
})
*/