const Koa = require('koa'),
    config = require('config'),
    logger = require('koa-logger'),
    err = require('./helpers/error'),
    serve = require('koa-static')
;



const {routes, allowedMethods} = require('./routes/index');

const app = new Koa();

//app.use(err);
app.use(logger());
app.use(serve(config.moderation.regionOCRModeration.base_dir));
app.use(serve('./public'));
app.use(routes());
app.use(allowedMethods());

// var bodyParser = require('body-parser');
// app.use(bodyParser.json({limit: "50mb"}));
// app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));



app.listen(config.server.port, function () {
    console.log('%s listening at port %d', config.app.name, config.server.port);
});