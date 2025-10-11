/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug defaults', function () {
    'use strict';

    it('should replace whitespaces with separator', function (done) {

        getSlug('foo bar baz')
            .should.eql('foo-bar-baz');

        done();
    });

    it('should remove trailing space if any', function (done) {

        getSlug(' foo bar baz ')
            .should.eql('foo-bar-baz');

        done();
    });

    it('should remove multiple whitespaces', function (done) {

        getSlug(' foo bar  baz   FOO    BAR      BAZ      ')
            .should.eql('foo-bar-baz-foo-bar-baz');

        done();
    });

    it('should remove multiple separators at start and end', function (done) {

        getSlug('-foo- bar -baz-')
            .should.eql('foo-bar-baz');
        getSlug('--foo- bar -baz---')
            .should.eql('foo-bar-baz');
        getSlug('---foo- bar -baz---')
            .should.eql('foo-bar-baz');

        done();
    });

    it('should remove multple separators', function (done) {

        getSlug('foo- bar -baz')
            .should.eql('foo-bar-baz');

        done();
    });

    it('should remove non-base64 characters', function (done) {

        var nonBase64 = ['[', ']', ',', '*', '+', '~', '.', '(', ')', '\'', '"', '!', ':', '@'];

        for (var i = 0; i < nonBase64.length; i++) {
            getSlug("foo " + nonBase64[i] + " bar baz")
                .should.eql("foo-bar-baz");
        }

        done();
    });

    it('should remove trailing separator', function (done) {

        getSlug('C\'est un beau titre qui ne laisse rien à désirer  ! ')
            .should.eql(
                'c-est-un-beau-titre-qui-ne-laisse-rien-a-desirer');

        done();
    });

    it('should handle whitespace after symbol', function (done) {

        getSlug('∆299')
            .should.eql('delta-299');
        getSlug('∆world')
            .should.eql('delta-world');
        getSlug('∆-299')
            .should.eql('delta-299');
        getSlug('∆-world')
            .should.eql('delta-world');

        getSlug('(∆)299')
            .should.eql('delta-299');
        getSlug('(∆)299', {
                mark: true
            })
            .should.eql('(delta)299');

        getSlug('∆299')
            .should.eql('delta-299');
        getSlug('∆world')
            .should.eql('delta-world');

        getSlug('Hello∆299')
            .should.eql('hello-delta-299');
        getSlug('299∆Hello')
            .should.eql('299-delta-hello');

        done();
    });

    it('should not fail if symbol at the end', function (done) {

        getSlug('test &')
            .should.eql('test-and');
        getSlug('test & ')
            .should.eql('test-and');
        getSlug('test &', '_')
            .should.eql('test_and');
        getSlug('test ♥')
            .should.eql('test-love');
        getSlug('test ♥ ')
            .should.eql('test-love');
        getSlug('test ♥  ')
            .should.eql('test-love');

        done();

    });

});