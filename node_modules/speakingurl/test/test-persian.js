var getSlug = require('../lib/speakingurl');

describe('getSlug translate persian letters/numbers', function () {
    'use strict';

    it('should be ', function (done) {

        getSlug('گ چ پ ژ ک ی ۰ ۱ ۲ ۳ ۴ ۵ ۶ ۷ ۸ ۹', {
                lang: 'fa'
            })
            .should.eql('g-ch-p-zh-k-y-0-1-2-3-4-5-6-7-8-9');

        done();
    });

});