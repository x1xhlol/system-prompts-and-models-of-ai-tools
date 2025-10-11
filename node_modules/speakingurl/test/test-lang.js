/* global describe,it */
var getSlug = require('../lib/speakingurl');

describe('getSlug symbols', function () {
    'use strict';

    it('should convert symbols', function (done) {

        getSlug('Foo & Bar | Baz')
            .should.eql('foo-and-bar-or-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'cs'
            })
            .should.eql('foo-a-bar-nebo-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'en'
            })
            .should.eql('foo-and-bar-or-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'de'
            })
            .should.eql('foo-und-bar-oder-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'fr'
            })
            .should.eql('foo-et-bar-ou-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'es'
            })
            .should.eql('foo-y-bar-u-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'ru'
            })
            .should.eql('foo-i-bar-ili-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'ro'
            })
            .should.eql('foo-si-bar-sau-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'sk'
            })
            .should.eql('foo-a-bar-alebo-baz');

        done();
    });

    it('shouldn\'t convert symbols', function (done) {

        getSlug('Foo & Bar | Baz', {
                symbols: false
            })
            .should.eql('foo-bar-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'en',
                symbols: false

            })
            .should.eql('foo-bar-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'de',
                symbols: false
            })
            .should.eql('foo-bar-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'fr',
                symbols: false
            })
            .should.eql('foo-bar-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'es',
                symbols: false
            })
            .should.eql('foo-bar-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'ru',
                symbols: false
            })
            .should.eql('foo-bar-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'cs',
                symbols: false
            })
            .should.eql('foo-bar-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'sk',
                symbols: false
            })
            .should.eql('foo-bar-baz');

        done();
    });

    it('should not convert symbols with uric flag true', function (done) {

        getSlug('Foo & Bar | Baz', {
                uric: true
            })
            .should.eql('foo-&-bar-or-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'en',
                uric: true
            })
            .should.eql('foo-&-bar-or-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'de',
                uric: true
            })
            .should.eql('foo-&-bar-oder-baz');
        getSlug('Foo & Bar | Baz', {
                lang: 'fr',
                uric: true
            })
            .should.eql('foo-&-bar-ou-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'es',
                uric: true
            })
            .should.eql('foo-&-bar-u-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'ru',
                uric: true
            })
            .should.eql('foo-&-bar-ili-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'cs',
                uric: true
            })
            .should.eql('foo-&-bar-nebo-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'sk',
                uric: true
            })
            .should.eql('foo-&-bar-alebo-baz');

        done();
    });

    it('should not convert symbols with uricNoSlash flag true', function (done) {

        getSlug('Foo & Bar | Baz', {
                uricNoSlash: true
            })
            .should.eql('foo-&-bar-or-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'en',
                uricNoSlash: true
            })
            .should.eql('foo-&-bar-or-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'de',
                uricNoSlash: true
            })
            .should.eql('foo-&-bar-oder-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'fr',
                uricNoSlash: true
            })
            .should.eql('foo-&-bar-ou-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'es',
                uricNoSlash: true
            })
            .should.eql('foo-&-bar-u-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'ru',
                uricNoSlash: true
            })
            .should.eql('foo-&-bar-ili-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'cs',
                uricNoSlash: true
            })
            .should.eql('foo-&-bar-nebo-baz');

        getSlug('Foo & Bar | Baz', {
                lang: 'sk',
                uricNoSlash: true
            })
            .should.eql('foo-&-bar-alebo-baz');

        done();
    });

    it('should not convert symbols with mark flag true', function (done) {

        getSlug('Foo (Bar) . Baz', {
                mark: true
            })
            .should.eql('foo-(bar)-.-baz');

        getSlug('Foo (Bar) . Baz', {
                lang: 'en',
                mark: true
            })
            .should.eql('foo-(bar)-.-baz');

        getSlug('Foo (Bar) . Baz', {
                lang: 'de',
                mark: true
            })
            .should.eql('foo-(bar)-.-baz');

        getSlug('Foo (Bar) . Baz', {
                lang: 'fr',
                mark: true
            })
            .should.eql('foo-(bar)-.-baz');

        getSlug('Foo (Bar) . Baz', {
                lang: 'es',
                mark: true
            })
            .should.eql('foo-(bar)-.-baz');

        getSlug('Foo (Bar) . Baz', {
                lang: 'ru',
                mark: true
            })
            .should.eql('foo-(bar)-.-baz');

        getSlug('Foo (Bar) . Baz', {
                lang: 'cs',
                mark: true
            })
            .should.eql('foo-(bar)-.-baz');

        getSlug('Foo (Bar) . Baz', {
                lang: 'sk',
                mark: true
            })
            .should.eql('foo-(bar)-.-baz');

        done();

    });

    it('should convert symbols with flags true', function (done) {

        getSlug('Foo (♥) ; Baz=Bar', {
                lang: 'en',
                uric: true,
                uricNoSlash: true,
                mark: true
            })
            .should.eql('foo-(love)-;-baz=bar');

        getSlug('Foo (♥) ; Baz=Bar', {
                lang: 'de',
                uric: true,
                uricNoSlash: true,
                mark: true
            })
            .should.eql('foo-(liebe)-;-baz=bar');

        getSlug('Foo (♥) ; Baz=Bar', {
                lang: 'fr',
                uric: true,
                uricNoSlash: true,
                mark: true
            })
            .should.eql('foo-(amour)-;-baz=bar');

        getSlug('Foo (♥) ; Baz=Bar', {
                lang: 'es',
                uric: true,
                uricNoSlash: true,
                mark: true
            })
            .should.eql('foo-(amor)-;-baz=bar');

        getSlug('Foo (♥) ; Baz=Bar', {
                lang: 'ru',
                uric: true,
                uricNoSlash: true,
                mark: true
            })
            .should.eql('foo-(lubov)-;-baz=bar');

        getSlug('Foo (♥) ; Baz=Bar', {
                lang: 'cs',
                uric: true,
                uricNoSlash: true,
                mark: true
            })
            .should.eql('foo-(laska)-;-baz=bar');

        getSlug('Foo (♥) ; Baz=Bar', {
                lang: 'sk',
                uric: true,
                uricNoSlash: true,
                mark: true
            })
            .should.eql('foo-(laska)-;-baz=bar');

        getSlug(' Sch(* )ner (♥)Ti♥tel ♥läßt grüßen!? Bel♥♥ été !', {
                lang: 'en',
                uric: true,
                uricNoSlash: true,
                mark: true,
                maintainCase: true
            })
            .should.eql(
                'Sch(*-)ner-(love)Ti-love-tel-love-laesst-gruessen!?-Bel-love-love-ete-!'
            );

        done();
    });

    it('should replace symbols (de)', function (done) {

        getSlug('Äpfel & Birnen', {
                lang: 'de'
            })
            .should.eql('aepfel-und-birnen');

        getSlug('ÄÖÜäöüß', {
                lang: 'de',
                maintainCase: true
            })
            .should.eql('AeOeUeaeoeuess');

        done();
    });

    it('should replace chars by cs language standards', function (done) {

        getSlug(
                'AaÁáBbCcČčDdĎďEeÉéĚěFfGgHhChchIiÍíJjKkLlMmNnŇňOoÓóPpQqRrŘřSsŠšTtŤťUuÚúŮůVvWwXxYyÝýZzŽž', {
                    lang: 'cs'
                })
            .should.eql(
                'aaaabbccccddddeeeeeeffgghhchchiiiijjkkllmmnnnnooooppqqrrrrssssttttuuuuuuvvwwxxyyyyzzzz'
            );

        getSlug(
                'AaÁáBbCcČčDdĎďEeÉéĚěFfGgHhChchIiÍíJjKkLlMmNnŇňOoÓóPpQqRrŘřSsŠšTtŤťUuÚúŮůVvWwXxYyÝýZzŽž', {
                    lang: 'cs',
                    maintainCase: true
                })
            .should.eql(
                'AaAaBbCcCcDdDdEeEeEeFfGgHhChchIiIiJjKkLlMmNnNnOoOoPpQqRrRrSsSsTtTtUuUuUuVvWwXxYyYyZzZz'
            );

        done();
    });

    it('should replace chars by se language standards', function (done) {

        getSlug(
                'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZzÅåÄäÖö', {
                    lang: 'sv',
                    maintainCase: true
                })
            .should.eql(
                'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZzAaAaOo'
            );

        done();
    });

    it('should replace chars by fi language standards', function (done) {

        getSlug(
                'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZzÅåÄäÖö', {
                    lang: 'fi',
                    maintainCase: true
                })
            .should.eql(
                'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZzAaAaOo'
            );

        done();
    });

    it('should replace chars by sk language standards', function (done) {

        getSlug(
                'AaÁaÄäBbCcČčDdĎďDzdzDždžEeÉéFfGgHhChchIiÍíJjKkLlĹĺĽľMmNnŇňOoÓóÔôPpQqRrŔŕSsŠšTtŤťUuÚúVvWwXxYyÝýZzŽž', {
                    lang: 'sk'
                })
            .should.eql(
                'aaaaaabbccccdddddzdzdzdzeeeeffgghhchchiiiijjkkllllllmmnnnnooooooppqqrrrrssssttttuuuuvvwwxxyyyyzzzz'
            );

        getSlug(
                'AaÁaÄäBbCcČčDdĎďDzdzDždžEeÉéFfGgHhChchIiÍíJjKkLlĹĺĽľMmNnŇňOoÓóÔôPpQqRrŔŕSsŠšTtŤťUuÚúVvWwXxYyÝýZzŽž', {
                    lang: 'sk',
                    maintainCase: true
                })
            .should.eql(
                'AaAaAaBbCcCcDdDdDzdzDzdzEeEeFfGgHhChchIiIiJjKkLlLlLlMmNnNnOoOoOoPpQqRrRrSsSsTtTtUuUuVvWwXxYyYyZzZz'
            );

        done();
    });

    it('should ignore not available language param', function (done) {

        getSlug('Äpfel & Birnen', {
                lang: 'xx'
            })
            .should.eql('aepfel-and-birnen');

        done();
    });

    it('should convert currency symbols to lowercase', function (done) {

        getSlug('NEXUS4 only €199!', {
                maintainCase: false
            })
            .should.eql('nexus4-only-eur199');

        getSlug('NEXUS4 only €299.93', {
                maintainCase: false
            })
            .should.eql('nexus4-only-eur299-93');

        getSlug('NEXUS4 only 円399.73', {
                maintainCase: false
            })
            .should.eql('nexus4-only-yen399-73');

        done();
    });

    it('should convert currency symbols to uppercase', function (done) {

        getSlug('NEXUS4 only €199!', {
                maintainCase: true
            })
            .should.eql('NEXUS4-only-EUR199');

        getSlug('NEXUS4 only €299.93', {
                maintainCase: true
            })
            .should.eql('NEXUS4-only-EUR299-93');

        getSlug('NEXUS4 only 円399.73', {
                maintainCase: true
            })
            .should.eql('NEXUS4-only-YEN399-73');

        done();
    });
});