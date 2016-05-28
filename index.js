var trequire = require('trequire');
var _ = require('lodash');
var fs = trequire('fs');
var path = require('path');
var Service = require('./lib/service');

var root = process.env.DOCKER_SERVICE_ROOT || '/etc/docker-services';
if(!fs.existsSync(root)) fs.mkdirSync(root);

var services = {};
fs.readdirSync(root).forEach(function(link) {
	if (!fs.lstatSync(path.join(root, link)).isDirectory()) { return; }
	var service = new Service(fs.realpathSync(path.join(root, link)), services);
	services[service.name] = service;
});

function *list() {
	var result = [];
	var arr = _.toArray(services);

	for(var x = 0; x < arr.length; x++) {
		result.push(((yield arr[x].isRunning()) ? '(Running) ' : '(Stopped) ') + arr[x].name);
	}

	return result.sort();
}

function *status(name) {
	if(!services[name]) throw new Error('No service by that name');
	return yield services[name].toString();
}

function *get(name) {
	if(!services[name]) throw new Error('No service by that name');
	return services[name];
}

module.exports = {
	list: list,
	status: status,
	get: get
};
