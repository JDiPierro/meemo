'use strict';

var superagent = require('superagent');

var g_server = '';
var g_token = localStorage.token || '';

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function errorWrapper(callback) {
    return function (error, result) {
        if (error && error.status === 401) return module.exports.loginFailed();

        callback(error, result);
    };
}

function url(path) {
    return g_server + path + '?token=' + g_token;
}

function Thing(id, createdAt, tags, content, richContent) {
    this.id = id;
    this.createdAt = createdAt || 0;
    this.tags = tags || [];
    this.content = content;
    this.richContent = richContent;
}

function ThingsApi() {
    this._addCallbacks = [];
    this._editCallbacks = [];
    this._delCallbacks = [];
    this._operation = '';
}

ThingsApi.prototype.get = function (filter, callback) {
    var that = this;
    var u = url('/api/things');
    var operation = guid();

    this._operation = operation;

    if (filter) u += '&filter=' + encodeURIComponent(filter);

    superagent.get(u).end(errorWrapper(function (error, result) {
        // ignore this if we moved on
        if (that._operation !== operation) {
            console.log('ignore this call');
            return;
        }

        if (error) return callback(error);
        if (result.status !== 200) return callback(new Error('Failed: ' + result.status + '. ' + result.text));

        var tmp = result.body.things.map(function (thing) {
            return new Thing(thing._id, new Date(thing.createdAt).getTime(), thing.tags, thing.content, thing.richContent);
        });

        callback(null, tmp);
    }));
};

ThingsApi.prototype.add = function (content, callback) {
    var that = this;

    superagent.post(url('/api/things')).send({ content: content }).end(errorWrapper(function (error, result) {
        if (error) return callback(error);
        if (result.status !== 201) return callback(new Error('Failed: ' + result.status + '. ' + result.text));

        that._addCallbacks.forEach(function (callback) {
            setTimeout(callback, 0);
        });

        callback(null);
    }));
};

ThingsApi.prototype.edit = function (thing, callback) {
    var that = this;

    superagent.put(url('/api/things/' + thing.id)).send({ content: thing.content }).end(errorWrapper(function (error, result) {
        if (error) return callback(error);
        if (result.status !== 201) return callback(new Error('Failed: ' + result.status + '. ' + result.text));

        that._editCallbacks.forEach(function (callback) {
            setTimeout(callback, 0);
        });

        callback(null);
    }));
};

ThingsApi.prototype.del = function (thing, callback) {
    var that = this;

    superagent.del(url('/api/things/' + thing.id)).end(errorWrapper(function (error, result) {
        if (error) return callback(error);
        if (result.status !== 200) return callback(new Error('Failed: ' + result.status + '. ' + result.text));

        that._delCallbacks.forEach(function (callback) {
            setTimeout(callback, 0);
        });

        callback(null);
    }));
};

ThingsApi.prototype.onAdded = function (callback) {
    this._addCallbacks.push(callback);
};

ThingsApi.prototype.onEdited = function (callback) {
    this._editCallbacks.push(callback);
};

ThingsApi.prototype.onDeleted = function (callback) {
    this._delCallbacks.push(callback);
};

ThingsApi.prototype.export = function () {
    window.location.href = url('/api/export');
};

function SettingsApi() {
    this._changeCallbacks = [];
    this.data = {};
    this.reset();
}

SettingsApi.prototype.reset = function () {
    this.data.title = 'Guacamoly';
    this.data.backgroundUrl =  '';
};

SettingsApi.prototype.save = function (callback) {
    superagent.post(url('/api/settings')).send({ settings: this.data }).end(errorWrapper(function (error, result) {
        if (error) return callback(error);
        if (result.status !== 202) return callback(new Error('Failed: ' + result.status + '. ' + result.text));

        callback(null);
    }));
};

SettingsApi.prototype.get = function (callback) {
    var that = this;

    superagent.get(url('/api/settings')).end(errorWrapper(function (error, result) {
        if (error) return callback(error);
        if (result.status !== 200) return callback(new Error('Failed: ' + result.status + '. ' + result.text));

        that.set(result.body.settings);

        callback(null, result.body.settings);
    }));
};

SettingsApi.prototype.set = function (data) {
    var that = this;

    this.data.title = data.title;
    this.data.backgroundUrl = data.backgroundUrl;

    this._changeCallbacks.forEach(function (callback) {
        setTimeout(callback.bind(null, that.data), 0);
    });
};

SettingsApi.prototype.onChanged = function (callback) {
    this._changeCallbacks.push(callback);
};

function TagsApi() {}

TagsApi.prototype.get = function (callback) {
    superagent.get(url('/api/tags')).end(errorWrapper(function (error, result) {
        if (error) return callback(error);
        if (result.status !== 200) return callback(new Error('Failed: ' + result.status + '. ' + result.text));

        callback(null, result.body.tags);
    }));
};

function SessionApi() {}

SessionApi.prototype.login = function (username, password, callback) {
    superagent.post(g_server + '/api/login').send({ username: username, password: password }).end(function (error, result) {
        if (error) return callback(error);
        if (result.status !== 201) return callback(new Error('Login failed. ' + result.status + '. ' + result.text));

        g_token = result.body.token;
        localStorage.token = g_token;

        callback(null);
    });
};

SessionApi.prototype.logout = function () {
    superagent.get(url('/api/logout')).end(function (error, result) {
        if (error) console.error(error);
        if (result.status !== 200) console.error('Logout failed.', result.status, result.text);

        g_token = '';
        delete localStorage.token;

        module.exports.onLogout();
    });
};

module.exports = {
    loginFailed: function () {},
    onLogout: function () {},
    Thing: Thing,
    session: new SessionApi(),
    settings: new SettingsApi(),
    things: new ThingsApi(),
    tags: new TagsApi()
};