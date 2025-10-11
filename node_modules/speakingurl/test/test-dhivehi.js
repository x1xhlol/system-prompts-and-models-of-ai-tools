/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug translate dhivehi letters', function () {
    'use strict';

    it('should be ', function (done) {

        getSlug('މއދކ ވ ރ ށ ރީތި', {
                lang: 'dv'
            })
            .should.eql('madhk-v-r-sh-reethi');

        done();
    });

});