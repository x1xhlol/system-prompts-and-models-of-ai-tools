/* global describe,it, before */

describe('getSlug translate sentence with accent words', function () {
    'use strict';

    describe('default options', function () {

        var getSlug = require('../lib/speakingurl').createSlug({

        });

        it('single word', function (done) {

            getSlug('Ánhanguera')
                .should.eql('anhanguera');

            done();
        });

        it('middle of sentence', function (done) {

            getSlug('foo Ánhanguera bar')
                .should.eql('foo-anhanguera-bar');

            done();
        });

        it('beginning of sentence', function (done) {

            getSlug('Ánhanguera foo bar')
                .should.eql('anhanguera-foo-bar');

            done();
        });

        it('end of sentence', function (done) {

            getSlug('Ánhanguera fooá')
                .should.eql('anhanguera-fooa');

            done();
        });
    });

    describe('titlecase options', function () {

        var getSlug = require('../lib/speakingurl').createSlug({
            titleCase: [
                'a', 'an', 'and', 'as', 'at', 'but',
                'by', 'en', 'for', 'if', 'in', 'nor',
                'of', 'on', 'or', 'per', 'the', 'to', 'vs'
            ]
        });

        it('single word', function (done) {

            getSlug('Ánhanguera')
                .should.eql('Anhanguera');

            done();
        });

        it('middle of sentence', function (done) {

            getSlug('foo Ánhanguera bar')
                .should.eql('Foo-Anhanguera-Bar');

            done();
        });

        it('middle of sentence, with exception', function (done) {

            getSlug('foo Ánhanguera And bar')
                .should.eql('Foo-Anhanguera-and-Bar');

            done();
        });

        it('beginning of sentence', function (done) {

            getSlug('Ánhanguera foo Ánhanguera')
                .should.eql('Anhanguera-Foo-Anhanguera');

            done();
        });

        it('beginning of sentence, with exception', function (done) {

            getSlug('Ánhanguera and Ánhanguera')
                .should.eql('Anhanguera-and-Anhanguera');

            done();
        });

        it('end of sentence', function (done) {

            getSlug('Ánhanguera foo bará')
                .should.eql('Anhanguera-Foo-Bara');

            done();
        });

        it('end of sentence, with exception', function (done) {

            getSlug('Ánhanguera foo and bará')
                .should.eql('Anhanguera-Foo-and-Bara');

            done();
        });
    });
});