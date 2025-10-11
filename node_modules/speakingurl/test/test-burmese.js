/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug translate burmese letters', function () {
    'use strict';

    it('one consonant', function (done) {
        getSlug('မ', {
                lang: 'my'
            })
            .should.eql('m');

        done();
    });

    it('one independent vowel', function (done) {
        getSlug('ဪ', {
                lang: 'my'
            })
            .should.eql('aw');

        done();
    });

    it('one consonant with one vowel', function (done) {

        getSlug('ကာ', {
                lang: 'my'
            })
            .should.eql('ka');

        done();
    });

    it('one consonant and multiple vowels', function (done) {

        getSlug('ကော', {
                lang: 'my'
            })
            .should.eql('kaw');

        getSlug('ကော်', {
                lang: 'my'
            })
            .should.eql('kaw');

        getSlug('ကွဲ', {
                lang: 'my'
            })
            .should.eql('kwe');

        getSlug('ပေါ်', {
                lang: 'my'
            })
            .should.eql('paw');

        getSlug('ပို', {
                lang: 'my'
            })
            .should.eql('po');

        getSlug('ကူ', {
                lang: 'my'
            })
            .should.eql('ku');

        done();
    });

    it('one consonant and multiple medials', function (done) {
        getSlug('မျှ', {
                lang: 'my'
            })
            .should.eql('myah');

        getSlug('ကြွ', {
                lang: 'my'
            })
            .should.eql('kyw');

        getSlug('လွှ', {
                lang: 'my'
            })
            .should.eql('lwh');

        getSlug('မြွှ', {
                lang: 'my'
            })
            .should.eql('mywh');

        getSlug('ကုံ', {
                lang: 'my'
            })
            .should.eql('kon');

        getSlug('ဘွိုင်း', {
                lang: 'my'
            })
            .should.eql('bawaing');

        getSlug('လျှင်', {
                lang: 'my'
            })
            .should.eql('lyahin');
        done();
    });

    it('one pali word', function (done) {
        getSlug('စ္စ', {
                lang: 'my'
            })
            .should.eql('ss');

        done();
    });

    it('one single consonant and one consonant with asat', function (done) {
        getSlug('ကက်', {
                lang: 'my'
            })
            .should.eql('ket');

        getSlug('ပိုက်', {
                lang: 'my'
            })
            .should.eql('paik');

        getSlug('ကောက်', {
                lang: 'my'
            })
            .should.eql('kauk');
        done();
    });

    it('pali asat and tone marks', function (done) {
        getSlug('ကျွန်ုပ်', {
                lang: 'my'
            })
            .should.eql('kyawnub');

        getSlug('ပစ္စည်း', {
                lang: 'my'
            })
            .should.eql('pssi');

        getSlug('တက္ကသိုလ်', {
                lang: 'my'
            })
            .should.eql('tkkthol');

        getSlug('သဏ္ဍာန်', {
                lang: 'my'
            })
            .should.eql('thnadan');
        getSlug('လိမ္မော်', {
                lang: 'my'
            })
            .should.eql('limmaw');
        getSlug('စက္ကူ', {
                lang: 'my'
            })
            .should.eql('skku');
        getSlug('ဘဏ္ဍာ', {
                lang: 'my'
            })
            .should.eql('banada');
        getSlug('မင်္ဂလာ', {
                lang: 'my'
            })
            .should.eql('mingla');
        done();
    });

    it('simple sentence with spaces and tone marks', function (done) {
        getSlug('မြန်မာပြည် ကို တို့ချစ်သည်၊ တို့တိုင်းတို့ပြည်', {
                lang: 'my'
            })
            .should.eql('myanmapyi-ko-tokhyaitthi-totaingtopyi');

        getSlug('သတ္တဝါတွေ ကျန်းမာပါစေ။', {
                lang: 'my'
            })
            .should.eql('thttwatwe-kyaanmapase');

        getSlug('မြန်မာ သာဓက', {
                lang: 'my'
            })
            .should.eql('myanma-thadak');
        done();
    });

    it('complex sentences with combinations of consonants, vowels and diatrics', function (done) {
        getSlug('ဘင်္ဂလား ပင်လယ်အော် တွင် ယနေ့ နေသာသည်။', {
                lang: 'my'
            })
            .should.eql('baingla-pinleaaw-twin-yne-nethathi');

        getSlug('ဗုဒ္ဓဘာသာ မြန်မာလူမျိုး', {
                lang: 'my'
            })
            .should.eql('buddabaatha-myanmalumyao');
        done();
    });
});