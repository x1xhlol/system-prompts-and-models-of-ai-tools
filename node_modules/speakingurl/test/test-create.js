/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug create', function () {
    'use strict';

    it('with symbols', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                lang: 'en',
                uric: true,
                uricNoSlash: true,
                mark: true
            });

        getSlug('Foo (♥) ; Baz=Bar')
            .should.eql('foo-(love)-;-baz=bar');

        done();
    });

    it('without options', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug();

        getSlug('Foo Bar Baz')
            .should.eql('foo-bar-baz');

        done();
    });

    it('with empty options', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({});

        getSlug('Foo Bar Baz')
            .should.eql('foo-bar-baz');

        done();
    });

    it('with maintainCase', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                maintainCase: true
            });

        getSlug('Foo Bar Baz')
            .should.eql('Foo-Bar-Baz');

        done();
    });

    it('with uric', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                uric: true
            });

        getSlug(' :80:/Foo/Bar/Baz:Foo')
            .should.eql(':80:/foo/bar/baz:foo');

        done();
    });

    it('with uricNoSlash', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                uricNoSlash: true
            });

        getSlug('Foo/ Bar= Baz')
            .should.eql('foo-bar=-baz');

        done();
    });

    it('with mark', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                mark: true
            });

        getSlug('Foo* Bar Baz')
            .should.eql('foo*-bar-baz');

        done();
    });

    it('with truncate', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                truncate: 15
            });

        getSlug('Foo* Foobar FooBarBaz')
            .should.eql('foo-foobar');

        done();
    });

    it('with separator', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                separator: '_'
            });

        getSlug('Foo* Foobar FooBarBaz')
            .should.eql('foo_foobar_foobarbaz');

        done();
    });

    it('with mark and maintainCase', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                mark: true,
                maintainCase: true
            });

        getSlug('Foo* Bar Baz')
            .should.eql('Foo*-Bar-Baz');

        done();
    });

    it('with custom chars replacement', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                custom: {
                    '*': 'o'
                }
            });

        getSlug('xyl*ph*n')
            .should.eql('xylophon');

        done();
    });

    it('with custom chars leet replacement', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                custom: {
                    'a': '4',
                    'b': '8',
                    'e': '3',
                    'g': '6',
                    'l': '1',
                    'o': '0',
                    's': '5',
                    't': '7'
                },
                lang: false
            });

        getSlug('apbpepgplpopspt')
            .should.eql('4p8p3p6p1p0p5p7');
        getSlug('papbpepgplpopsptp')
            .should.eql('p4p8p3p6p1p0p5p7p');
        getSlug('qabqegqloqst')
            .should.eql('q48q36q10q57');
        getSlug('abeglost')
            .should.eql('48361057');

        done();
    });

    it('with custom chars replacement with not allowed target char', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                custom: {
                    'o': '*'
                }
            });

        getSlug('xylophon')
            .should.eql('xyl-ph-n');

        done();
    });

    it('with custom chars replacement with allowed target char, option mark', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                custom: {
                    'o': '*'
                },
                mark: true
            });

        getSlug('xylophon')
            .should.eql('xyl*ph*n');

        done();
    });

    it('with custom chars replacement with option mark', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                custom: {
                    '*': 'o'
                },
                mark: true
            });

        getSlug('xyl*ph*n')
            .should.eql('xylophon');

        done();
    });

    it('with custom char to string replacement', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                custom: {
                    '*': 'STAR',
                    'q': 'qqq',
                    'and': '',
                    'or': ''
                }
            });

        getSlug('xyl*ph*n')
            .should.eql('xylstarphstarn');
        getSlug('quack')
            .should.eql('qqquack');
        getSlug('Foo and Bar or Baz')
            .should.eql('foo-bar-baz');

        done();
    });

    it('with custom string replacement', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                custom: {
                    'and': 'und',
                    'or': 'oder',
                    '*': ' and '
                }
            });

        getSlug('bus and train')
            .should.eql('bus-und-train');
        getSlug('bus or train')
            .should.eql('bus-oder-train');
        getSlug('busandtrain')
            .should.eql('busandtrain');
        getSlug('busortrain')
            .should.eql('busortrain');
        getSlug('bus*train')
            .should.eql('bus-and-train');

        getSlug('bus and train bus and train')
            .should.eql('bus-und-train-bus-und-train');
        getSlug('bus or train bus or train')
            .should.eql('bus-oder-train-bus-oder-train');
        getSlug('busandtrain busandtrain')
            .should.eql('busandtrain-busandtrain');
        getSlug('busortrain busortrain')
            .should.eql('busortrain-busortrain');

        done();
    });

    it('with custom string replacement with option mark', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                custom: {
                    '*': 'STAR',
                    'q': 'qqq',
                    'z': ''
                },
                mark: true
            });

        getSlug('xyl*ph*n')
            .should.eql('xylstarphstarn');
        getSlug('qxxx')
            .should.eql('qqqxxx');
        getSlug('xxxqxxx')
            .should.eql('xxxqqqxxx');
        getSlug('qqq')
            .should.eql('qqqqqqqqq');
        getSlug('*q*')
            .should.eql('starqqqstar');
        getSlug('zoo')
            .should.eql('oo');
        getSlug('zooz')
            .should.eql('oo');

        done();
    });

    it('with custom string replacement with option maintainCase', function (done) {

        var getSlug = require('../lib/speakingurl')
            .createSlug({
                custom: {
                    '*': 'STAR',
                    'q': 'qqq',
                },
                maintainCase: true
            });

        getSlug('xyl*ph*n')
            .should.eql('xylSTARphSTARn');
        getSlug('qXXX')
            .should.eql('qqqXXX');
        getSlug('qqq')
            .should.eql('qqqqqqqqq');
        getSlug('*q*')
            .should.eql('STARqqqSTAR');

        done();
    });
});