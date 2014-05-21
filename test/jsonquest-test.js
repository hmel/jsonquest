'use strict';

var http = require('http');
var https = require('https');
var fs = require('fs');
var assert = require('assert');
var jsonquest = require('../');
var querystring = require('querystring');

describe('jsonquest', function() {
  var server = null;
  var port = 9995;
  afterEach(function (done) {
    server.close(done);
  });

  it('should process json requests correctly', function (done) {    
    server = http.createServer(function (req, res) {
      var data = '';

      assert.equal(req.method, 'PUT');
      assert.equal(req.url, '/hello');
      assert.equal(req.headers['content-type'], 'application/json');
      assert.equal(req.headers.authorization, 'Basic dXNlcjpwYXNz');

      req.on('data', function (chunk) {
        data += chunk.toString('utf8');
      });

      req.on('end', function () {
        assert.deepEqual(JSON.parse(data), { hello: 'world', witaj: 'świecie' });

        res.writeHead(201, { 'content-type': 'application/json' });
        res.write(JSON.stringify({ world: 'hello', świecie: 'witaj' }));
        res.end();
      });
    }).listen(port, function () {
      jsonquest({
        host: 'localhost',
        port: port,
        path: '/hello',
        body: { hello: 'world', witaj: 'świecie' },
        method: 'PUT',
        protocol: 'http',
        auth: 'user:pass'
      }, function (err, res, body) {
        assert.equal(res.statusCode, 201);
        assert.deepEqual(body, { world: 'hello', świecie: 'witaj' });
        assert.equal(res.headers['content-type'], 'application/json');
        done();
      });
    });
  });

  it('should fail on bad auth', function (done) {
    server = http.createServer(function (req, res) {
      var data = '';

      assert.equal(req.method, 'PUT');
      assert.equal(req.url, '/hello');
      assert.equal(req.headers['content-type'], 'application/json');
      assert.equal(req.headers.authorization, 'Basic dXNlcjpwYXNz');

      req.on('data', function (chunk) {
        data += chunk.toString('utf8');
      });

      req.on('end', function () {
        assert.deepEqual(JSON.parse(data), { hello: 'world', witaj: 'świecie' });

        res.writeHead(201, { 'content-type': 'application/json' });
        res.write('This is a string');
        res.end();
      });
    }).listen(port, function () {
      jsonquest({
        host: 'localhost',
        port: port,
        path: '/hello',
        body: { hello: 'world', witaj: 'świecie' },
        method: 'PUT',
        protocol: 'http',
        auth: 'user:pass'
      }, function (err) {
        assert(err);
        done();
      });
    });
  });

  it('should handle queryString request', function (done) {
    server = http.createServer(function (req, res) {
      var data = '';

      assert.equal(req.method, 'PUT');
      assert.equal(req.url, '/hello');
      assert.equal(req.headers['content-type'], 'application/x-www-form-urlencoded');
      assert.equal(req.headers.authorization, 'Basic dXNlcjpwYXNz');

      req.on('data', function (chunk) {
        data += chunk.toString('utf8');
      });

      req.on('end', function () {
        assert.deepEqual(querystring.parse(data), { hello: 'world', witaj: 'świecie' });

        res.writeHead(201, { 'content-type': 'application/json' });
        res.write(JSON.stringify({ world: 'hello', świecie: 'witaj' }));
        res.end();
      });
    }).listen(port, function () {
      jsonquest({
        host: 'localhost',
        port: port,
        path: '/hello',
        body: { hello: 'world', witaj: 'świecie' },
        method: 'PUT',
        protocol: 'http',
        auth: 'user:pass',
        requestEncoding: 'queryString'
      }, function (err, res, body) {
        assert.equal(res.statusCode, 201);
        assert.deepEqual(body, { world: 'hello', świecie: 'witaj' });
        assert.equal(res.headers['content-type'], 'application/json');
        done();
      });
    });
  });

  it('should fail on mismatched peer certificate', function (done) {
    var httpsOptions = {
      key: fs.readFileSync('test/fixtures/keys/key.pem'),
      cert: fs.readFileSync('test/fixtures/keys/cert.pem')
    };
    server = https.createServer(httpsOptions, function (req, res) {
      var data = '';

      assert.equal(req.method, 'PUT');
      assert.equal(req.url, '/hello');
      assert.equal(req.headers['content-type'], 'application/json');

      req.on('data', function (chunk) {
        data += chunk.toString('utf8');
      });

      req.on('end', function () {
        assert.equal(data, '');

        res.writeHead(201, { 'content-type': 'application/json' });
        res.write(JSON.stringify({ world: 'hello', świecie: 'witaj' }));
        res.end();
      });
    }).listen(port, function () {
      jsonquest({
        host: 'localhost',
        port: port,
        path: '/hello',
        body: { hello: 'world', witaj: 'świecie' },
        method: 'PUT',
        protocol: 'https',
        fingerprint: 'xx'
      }, function (err) {
        assert.equal(err.message, 'Peer fingerprint doesn\'t match!');
        done();
      });
    });
  });

  it('should succeed on correct peer certificate', function (done) {
    var httpsOptions = {
      key: fs.readFileSync('test/fixtures/keys/key.pem'),
      cert: fs.readFileSync('test/fixtures/keys/cert.pem')
    };
    server = https.createServer(httpsOptions, function (req, res) {
      var data = '';

      assert.equal(req.method, 'PUT');
      assert.equal(req.url, '/hello');
      assert.equal(req.headers['content-type'], 'application/json');

      req.on('data', function (chunk) {
        data += chunk.toString('utf8');
      });

      req.on('end', function () {
        assert.deepEqual(JSON.parse(data), { hello: 'world', witaj: 'świecie' });

        res.writeHead(201, { 'content-type': 'application/json' });
        res.write(JSON.stringify({ world: 'hello', świecie: 'witaj' }));
        res.end();
      });
    }).listen(port, function () {
      jsonquest({
        host: 'localhost',
        port: port,
        path: '/hello',
        body: { hello: 'world', witaj: 'świecie' },
        method: 'PUT',
        protocol: 'https',
        fingerprint: '6B:32:68:91:B0:2D:01:10:59:DC:6F:2A:49:7C:13:7C:B6:05:68:EE'
      }, function (err, res, body) {
        assert.ifError(err);
        assert.equal(res.statusCode, 201);
        assert.deepEqual(body, { world: 'hello', świecie: 'witaj' });
        assert.equal(res.headers['content-type'], 'application/json');
        done();
      });
    });
  });

});
