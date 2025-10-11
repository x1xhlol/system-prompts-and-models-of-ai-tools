/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug translate turkish letters', function () {
    'use strict';

    it('umlaut should be single letter transliteration', function (done) {

        getSlug('ÜÄÖüäö', {
                lang: 'tr'
            })
            .should.eql('uaeouaeo');

        getSlug('ÜÖÄ äüö', {
                lang: 'tr'
            })
            .should.eql('uoae-aeuo');

        done();
    });

});