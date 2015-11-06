##### Task 1 - Complete set/get
* Created express webserver instance
* Set up two routes with '/set' and '/get'
* Created Redis client
* Called client.get and client.set method
```
app.get('/get', function(req, res) {
	client.get("key", function(err,value){ res.send(value)});
});

app.get('/set', function(req, res) {
	client.set("key", "DevOps");
});
```
##### Task 2 - Complete set/get
* Used Redis array to store all visited URLs
* Used express app.use method to put every visited URL in array
* Trimmed down entries to show latest 5 visited URLs

```
	client.lpush("recent_urls",req.url);
	client.ltrim("recent_urls", 0,4);
	
	
app.get('/recent', function(req, res) {
	client.lrange("recent_urls", 0,4, function(err,value){ res.send(value)});
});

```

##### Task 3 - Complete upload/meow
* Created Redis array to store uploaded images
* Retrieved latest entry when /meow route is called and displayed it on the screen

```
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

```

##### Task 4 - Additional service instance running
* Made same server to listen on port 3001
```

// HTTP SERVER
 var server1 = app.listen(3001, function () {

   var host = server1.address().address
   var port = server1.address().port

   console.log('Example app1 listening at http://%s:%s', host, port)
 })

```




##### Task 5 - Demonstrate proxy
* Used http-proxy module
* Created http server listening on port 3002
* Used Redis array's rpoplpush method to switch between two URL values in array
```
  client.lpush("servers", "http://127.0.0.1:3000")
  client.lpush("servers", "http://127.0.0.1:3001")
  
var balancer = http.createServer(function(req, res) {
	client.rpoplpush("servers","servers",function(err,source){
			proxy.web(req, res, { target: source });
	})
    
}).listen(3002);
```

### Screencast
This [screencast](https://youtu.be/6EdSWskb9Pk) demonstrates 5 tasks

