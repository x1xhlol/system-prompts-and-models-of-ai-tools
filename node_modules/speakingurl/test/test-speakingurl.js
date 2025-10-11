/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug config combinations', function () {
    'use strict';

    it('should separate with configured character, with non-Base64 separator', function (done) {

        getSlug('Foo, Bar Baz', {
                separator: '*',
                maintainCase: false
            })
            .should.eql('foo*bar*baz');

        getSlug('Foo- Bar Baz', {
                separator: '*',
                maintainCase: false
            })
            .should.eql('foo-*bar*baz');

        getSlug('Foo] Bar Baz', {
                separator: '*',
                maintainCase: false
            })
            .should.eql('foo*bar*baz');

        done();
    });

    it('should separate with configured character, with only Base64 characters allowed', function (done) {

        getSlug('Foo, Bar Baz', {
                separator: '_',
                onlyBase64: true
            })
            .should.eql('foo_bar_baz');

        getSlug('Foo- Bar Baz', {
                separator: '_',
                onlyBase64: true
            })
            .should.eql('foo-_bar_baz');

        getSlug('Foo] Bar Baz', {
                separator: '_',
                onlyBase64: true
            })
            .should.eql('foo_bar_baz');

        done();
    });

    it('should separate with configured character, with smart trim', function (done) {

        getSlug('Foobarbaz, Bar Baz', {
                separator: '_',
                truncate: 12
            })
            .should.eql('foobarbaz');

        getSlug('Foobarbaz, Bar Baz', {
                separator: '_',
                truncate: 15
            })
            .should.eql('foobarbaz_bar');

        getSlug(' Foobarbaz, Bar Baz', {
                separator: '_',
                truncate: 15
            })
            .should.eql('foobarbaz_bar');

        getSlug('  Foobarbaz,    Bar Baz', {
                separator: '_',
                truncate: 15
            })
            .should.eql('foobarbaz_bar');

        done();
    });

    it('should maintain case characters, with non-Base64 separator', function (done) {

        getSlug('Foo, Bar Baz', {
                maintainCase: true,
                separator: '*'
            })
            .should.eql('Foo*Bar*Baz');

        getSlug('Foo- Bar Baz', {
                maintainCase: true,
                separator: '*'
            })
            .should.eql('Foo-*Bar*Baz');

        getSlug('Foo] Bar Baz', {
                maintainCase: true,
                separator: '*'
            })
            .should.eql('Foo*Bar*Baz');

        done();
    });

    it('should maintain case characters, with only Base64 characters allowed', function (done) {

        getSlug('Foo, Bar Baz', {
                maintainCase: true,
                uric: false,
                uricNoSlash: false,
                mark: false
            })
            .should.eql('Foo-Bar-Baz');

        getSlug('Foo- Bar Baz', {
                maintainCase: true,
                uric: false,
                uricNoSlash: false,
                mark: false
            })
            .should.eql('Foo-Bar-Baz');

        getSlug('Foo] Bar Baz', {
                maintainCase: true,
                uric: false,
                uricNoSlash: false,
                mark: false
            })
            .should.eql('Foo-Bar-Baz');

        done();
    });

    it('should maintain case characters, with smart trim', function (done) {

        getSlug('Foobarbaz, Bar Baz', {
                maintainCase: true,
                truncate: 12
            })
            .should.eql('Foobarbaz');

        getSlug('Foobarbaz, Bar Baz', {
                maintainCase: true,
                truncate: 15
            })
            .should.eql('Foobarbaz-Bar');

        getSlug(' Foobarbaz, Bar Baz', {
                maintainCase: true,
                truncate: 15
            })
            .should.eql('Foobarbaz-Bar');

        getSlug('  Foobarbaz,    Bar Baz', {
                maintainCase: true,
                truncate: 15
            })
            .should.eql('Foobarbaz-Bar');

        done();
    });

    it('should prefer Base64 characters only', function (done) {

        getSlug('Foo, Bar Baz', {
                uric: false,
                uricNoSlash: false,
                mark: false
            })
            .should.eql('foo-bar-baz');

        getSlug('Foo- Bar Baz', {
                uric: false,
                uricNoSlash: false,
                mark: false
            })
            .should.eql('foo-bar-baz');

        getSlug('Foo] Bar Baz', {
                uric: false,
                uricNoSlash: false,
                mark: false
            })
            .should.eql('foo-bar-baz');

        getSlug('Foo* Bar Baz', {
                uric: false,
                uricNoSlash: false,
                mark: false
            })
            .should.eql('foo-bar-baz');

        done();
    });

});