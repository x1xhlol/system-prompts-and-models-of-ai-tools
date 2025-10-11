/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug rfc3986', function () {
    'use strict';

    it('"uric" characters allowed', function (done) {

        var chars = [';', '?', ':', '@', '&', '=', '+', ',', '/'];

        for (var i = 0; i < chars.length; i++) {

            getSlug("foo " + chars[i] + " bar baz", {
                    uric: true
                })
                .should.eql("foo-" + chars[i] + "-bar-baz");
        }

        done();
    });

    it('"uricNoSlash" characters allowed', function (done) {

        var chars = [';', '?', ':', '@', '&', '=', '+', ','];

        for (var i = 0; i < chars.length; i++) {
            getSlug("foo " + chars[i] + " bar baz", {
                    uricNoSlash: true
                })
                .should.eql("foo-" + chars[i] + "-bar-baz");
        }

        done();
    });

    it('"mark" characters allowed', function (done) {

        var chars = ['.', '!', '~', '*', '\'', '(', ')'];

        for (var i = 0; i < chars.length; i++) {
            getSlug("foo " + chars[i] + " bar baz", {
                    mark: true
                })
                .should.eql("foo-" + chars[i] + "-bar-baz");
        }

        done();
    });

    it('"uric" characters allowed, separator ";"', function (done) {

        var chars = ['?', ':', '@', '&', '=', '+', ',', '/'];

        for (var i = 0; i < chars.length; i++) {
            getSlug("foo " + chars[i] + " bar baz", {
                    uric: true,
                    separator: ';'
                })
                .should.eql("foo;" + chars[i] + ";bar;baz");
        }

        done();
    });

    it('"uric" characters allowed, separator ";" included in input string', function (done) {

        getSlug("foo ; bar baz", {
                uric: true,
                separator: ';'
            })
            .should.eql("foo;bar;baz");

        done();
    });

    it('"uricNoSlash" characters allowed, separator ";"', function (done) {

        var chars = ['?', ':', '@', '&', '=', '+', ','];

        for (var i = 0; i < chars.length; i++) {
            getSlug("foo " + chars[i] + " bar baz", {
                    uricNoSlash: true,
                    separator: ';'
                })
                .should.eql("foo;" + chars[i] + ";bar;baz");
        }

        done();
    });

    it('"uricNoSlash" characters allowed, separator ";" included in input string', function (done) {

        getSlug("foo ; bar baz", {
                uric: true,
                separator: ';'
            })
            .should.eql("foo;bar;baz");

        done();
    });

    it('"mark" characters allowed, separator "."', function (done) {

        var chars = ['!', '~', '*', '\'', '(', ')'];

        for (var i = 0; i < chars.length; i++) {
            getSlug("foo " + chars[i] + " bar baz", {
                    mark: true,
                    separator: '.'
                })
                .should.eql("foo." + chars[i] + ".bar.baz");
        }

        done();
    });

    it('"mark" characters allowed, separator "." included in input string', function (done) {

        getSlug("foo . bar baz", {
                uric: true,
                separator: '.'
            })
            .should.eql("foo.bar.baz");

        done();
    });
});