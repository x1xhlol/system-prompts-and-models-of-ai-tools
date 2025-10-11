/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug languages', function () {
    'use strict';

    it('should replace language specific symbols', function (done) {

        var symbolMap = {
            'ar': {
                '∆': 'delta',
                '∞': 'la-nihaya',
                '♥': 'hob',
                '&': 'wa',
                '|': 'aw',
                '<': 'aqal-men',
                '>': 'akbar-men',
                '∑': 'majmou',
                '¤': 'omla'
            },

            'cs': {
                '∆': 'delta',
                '∞': 'nekonecno',
                '♥': 'laska',
                '&': 'a',
                '|': 'nebo',
                '<': 'mensi nez',
                '>': 'vetsi nez',
                '∑': 'soucet',
                '¤': 'mena'
            },

            'de': {
                '∆': 'delta',
                '∞': 'unendlich',
                '♥': 'Liebe',
                '&': 'und',
                '|': 'oder',
                '<': 'kleiner als',
                '>': 'groesser als',
                '∑': 'Summe von',
                '¤': 'Waehrung'
            },

            'en': {
                '∆': 'delta',
                '∞': 'infinity',
                '♥': 'love',
                '&': 'and',
                '|': 'or',
                '<': 'less than',
                '>': 'greater than',
                '∑': 'sum',
                '¤': 'currency'
            },

            'es': {
                '∆': 'delta',
                '∞': 'infinito',
                '♥': 'amor',
                '&': 'y',
                '|': 'u',
                '<': 'menos que',
                '>': 'mas que',
                '∑': 'suma de los',
                '¤': 'moneda'
            },

            'fr': {
                '∆': 'delta',
                '∞': 'infiniment',
                '♥': 'Amour',
                '&': 'et',
                '|': 'ou',
                '<': 'moins que',
                '>': 'superieure a',
                '∑': 'somme des',
                '¤': 'monnaie'
            },

            'hu': {
                '∆': 'delta',
                '∞': 'vegtelen',
                '♥': 'szerelem',
                '&': 'es',
                '|': 'vagy',
                '<': 'kisebb mint',
                '>': 'nagyobb mint',
                '∑': 'szumma',
                '¤': 'penznem'
            },

            'my': {
                '∆': 'kwahkhyaet',
                '∞': 'asaonasme',
                '♥': 'akhyait',
                '&': 'nhin',
                '|': 'tho',
                '<': 'ngethaw',
                '>': 'kyithaw',
                '∑': 'paungld',
                '¤': 'ngwekye'
            },

            'nl': {
                '∆': 'delta',
                '∞': 'oneindig',
                '♥': 'liefde',
                '&': 'en',
                '|': 'of',
                '<': 'kleiner dan',
                '>': 'groter dan',
                '∑': 'som',
                '¤': 'valuta'
            },

            'it': {
                '∆': 'delta',
                '∞': 'infinito',
                '♥': 'amore',
                '&': 'e',
                '|': 'o',
                '<': 'minore di',
                '>': 'maggiore di',
                '∑': 'somma',
                '¤': 'moneta'
            },

            'pl': {
                '∆': 'delta',
                '∞': 'nieskonczonosc',
                '♥': 'milosc',
                '&': 'i',
                '|': 'lub',
                '<': 'mniejsze niz',
                '>': 'wieksze niz',
                '∑': 'suma',
                '¤': 'waluta'
            },

            'pt': {
                '∆': 'delta',
                '∞': 'infinito',
                '♥': 'amor',
                '&': 'e',
                '|': 'ou',
                '<': 'menor que',
                '>': 'maior que',
                '∑': 'soma',
                '¤': 'moeda'
            },

            'ru': {
                '∆': 'delta',
                '∞': 'beskonechno',
                '♥': 'lubov',
                '&': 'i',
                '|': 'ili',
                '<': 'menshe',
                '>': 'bolshe',
                '∑': 'summa',
                '¤': 'valjuta'
            },

            'sk': {
                '∆': 'delta',
                '∞': 'nekonecno',
                '♥': 'laska',
                '&': 'a',
                '|': 'alebo',
                '<': 'menej ako',
                '>': 'viac ako',
                '∑': 'sucet',
                '¤': 'mena'
            },

            'tr': {
                '∆': 'delta',
                '∞': 'sonsuzluk',
                '♥': 'ask',
                '&': 've',
                '|': 'veya',
                '<': 'kucuktur',
                '>': 'buyuktur',
                '∑': 'toplam',
                '¤': 'para birimi'
            },

            'vn': {
                '∆': 'delta',
                '∞': 'vo cuc',
                '♥': 'yeu',
                '&': 'va',
                '|': 'hoac',
                '<': 'nho hon',
                '>': 'lon hon',
                '∑': 'tong',
                '¤': 'tien te'
            }

        };

        Object.keys(symbolMap)
            .forEach(function (l) {

                // console.log('\ncheck language: ' + l);

                Object.keys(symbolMap[l])
                    .forEach(function (s) {

                        var k = symbolMap[l][s];

                        // console.log('check symbol: ' + s);

                        getSlug('Foo ' + s + ' Bar', {
                                lang: l,
                                maintainCase: true
                            })
                            .should.eql('Foo-' + getSlug(k, {
                                maintainCase: true
                            }) + '-Bar');

                        getSlug('Foo ' + s + ' Bar', {
                                lang: l
                            })
                            .should.eql('foo-' + getSlug(k) + '-bar');

                    });

            });

        getSlug('EN Foo & Bar ')
            .should.eql('en-foo-and-bar');

        getSlug('EN Foo & Bar ', {
                lang: "en"
            })
            .should.eql('en-foo-and-bar');

        getSlug('de Foo & Bar ', {
                lang: "de"
            })
            .should.eql('de-foo-und-bar');

        getSlug('True Foo & Bar ', {
                lang: true
            })
            .should.eql('true-foo-and-bar');

        getSlug('False Foo & Bar ', {
                lang: false
            })
            .should.eql('false-foo-bar');

        getSlug('False Foo & Bar ', {
                lang: false,
                symbols: true
            })
            .should.eql('false-foo-bar');

        getSlug('xx Foo & Bar ', {
                lang: "xx"
            })
            .should.eql('xx-foo-and-bar');

        getSlug('obj Foo & Bar ', {
                lang: {}
            })
            .should.eql('obj-foo-and-bar');

        getSlug('array Foo & Bar ', {
                lang: []
            })
            .should.eql('array-foo-and-bar');

        getSlug('array Foo & Bar ', {
                lang: [],
                symbols: false
            })
            .should.eql('array-foo-bar');

        getSlug('null Foo & Bar ', {
                lang: null
            })
            .should.eql('null-foo-and-bar');

        getSlug('null Foo & Bar ', {
                lang: null,
                symbols: false
            })
            .should.eql('null-foo-bar');

        getSlug('null Foo & Bar ', {
                lang: null,
                symbols: true
            })
            .should.eql('null-foo-and-bar');

        done();

    });
});