/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug translate georgien letters', function () {
    'use strict';

    it('should be ', function (done) {

        getSlug('აბ', {
                lang: 'ge'
            })
            .should.eql('ab');

        done();
    });

});