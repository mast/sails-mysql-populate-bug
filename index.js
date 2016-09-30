
var Waterline = require('waterline');
var adapterMysql = require('sails-mysql');
var waterline = new Waterline();

// Load models
var a = require('./ModelA.js');
var b = require('./ModelB.js');
waterline.loadCollection(Waterline.Collection.extend(a));
waterline.loadCollection(Waterline.Collection.extend(b));

// Init waterline
var dbconfig = {
    adapters: {
        'mysql': adapterMysql
    },

    connections: {
        mysql: {
            adapter: 'mysql',
            host: 'localhost',
            port: 3306,
            database: 'sailstest',
            user: 'USER',
            password: 'PASSWORD'
        }
    }
};

waterline.initialize(dbconfig, function (err, ontology)
{
    if (err)
    {
        console.log('Failed to initialize Waterline');
        return;
    }

    var ModelA = ontology.collections.modela;
    var ModelB = ontology.collections.modelb;

    // Verify
    ModelA.find()
    .populate('childs')
    .then(function(res)
    {
        console.log('TEST1: 2 items');
        console.log(res);
    });

    ModelA.find({a_id: 1})
    .populate('childs')
    .then(function(res)
    {
        console.log('TEST2:1 item');
        console.log(res);
    });
});
