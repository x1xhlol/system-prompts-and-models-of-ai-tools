/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug smart truncate', function () {
    'use strict';

    it('should maintain case characters, with smart truncate', function (done) {

        getSlug('Foobarbaz, Bar Baz', {
                truncate: 12
            })
            .should.eql('foobarbaz');

        getSlug('Foobarbaz, Bar Baz', {
                truncate: 15
            })
            .should.eql('foobarbaz-bar');

        getSlug(' Foobarbaz, Bar Baz', {
                truncate: 15
            })
            .should.eql('foobarbaz-bar');

        getSlug('  Foobarbaz,    Bar Baz', {
                truncate: 15
            })
            .should.eql('foobarbaz-bar');

        getSlug('Foo Foo bar Zoo Bar Baz', {
                truncate: 15
            })
            .should.eql('foo-foo-bar-zoo');

        getSlug('Foo Foo bar ZooBar Baz', {
                truncate: 15
            })
            .should.eql('foo-foo-bar');

        getSlug('Foo Foo bar ZooBar Baz', {
                truncate: 15
            })
            .should.eql('foo-foo-bar');

        getSlug('Foo Foo Bar Bar', {
                truncate: "foo"
            })
            .should.eql('foo-foo-bar-bar');

        getSlug('Foo Foo Bar Bar', {
                truncate: false
            })
            .should.eql('foo-foo-bar-bar');

        getSlug('Foo Foo Bar Bar', {
                truncate: true
            })
            .should.eql('foo-foo-bar-bar');

        getSlug('a Foo', {
                truncate: true
            })
            .should.eql('a-foo');

        done();

    });
});