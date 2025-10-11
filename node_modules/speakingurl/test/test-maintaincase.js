/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug maintainCase', function () {
    'use strict';

    it('should maintain case characters', function (done) {

        getSlug('Foo, Bar Baz', {
                maintainCase: true
            })
            .should.eql('Foo-Bar-Baz');

        getSlug('Foo- Bar Baz', {
                maintainCase: true
            })
            .should.eql('Foo-Bar-Baz');

        getSlug('Foo] Bar Baz', {
                maintainCase: true
            })
            .should.eql('Foo-Bar-Baz');

        getSlug('Foo > Bar ♥ Baz', {
                maintainCase: true
            })
            .should.eql('Foo-greater-than-Bar-love-Baz');

        done();
    });
});