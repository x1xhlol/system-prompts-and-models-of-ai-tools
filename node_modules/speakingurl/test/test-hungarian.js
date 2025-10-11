/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug translate hungarian letters', function () {
    'use strict';

    it('umlaut should be single letter transliteration', function (done) {

        getSlug('AÁEÉIÍOÓÖŐUÚÜŰ', {
                lang: 'hu'
            })
            .should.eql('aaeeiioooouuuu');

        getSlug('aáeéiíoóöőuúüű', {
                lang: 'hu'
            })
            .should.eql('aaeeiioooouuuu');

        getSlug('AÁEÉIÍOÓÖŐUÚÜŰ AÁEÉIÍOÓÖŐUÚÜŰ', {
                lang: 'hu'
            })
            .should.eql('aaeeiioooouuuu-aaeeiioooouuuu');

        getSlug('aáeéiíoóöőuúüű aáeéiíoóöőuúüű', {
                lang: 'hu'
            })
            .should.eql('aaeeiioooouuuu-aaeeiioooouuuu');

        done();
    });

});