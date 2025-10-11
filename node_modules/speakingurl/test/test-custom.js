/* global describe,it */

var getSlug = require('../lib/speakingurl');

describe('getSlug with custom replacement', function () {
    'use strict';

    it('should be transliterated', function (done) {

        getSlug('буу', {
                lang: false,
                custom: {
                    'б': 'б',
                    'у': 'у'
                }
            })
            .should.eql('буу');

        getSlug('[nodejs]', {
                custom: {
                    '[': '[',
                    ']': ']'
                }
            })
            .should.eql('[nodejs]');

        getSlug('[Äpfel]', {
                custom: {
                    '[': '[',
                    ']': ']'
                }
            })
            .should.eql('[aepfel]');

        getSlug('[Äpfel]', {
                lang: false,
                custom: {
                    '[': '[',
                    ']': ']'
                }
            })
            .should.eql('[aepfel]');

        done();
    });

    it('should be extended with allowed chars', function (done) {

        getSlug('буу', {
                custom: ['б', 'у']
            })
            .should.eql('буу');

        getSlug('[Knöpfe]', {
                custom: ['[', ']']
            })
            .should.eql('[knoepfe]');

        getSlug('[Knöpfe & Ösen]', {
                custom: ['[', ']']
            })
            .should.eql('[knoepfe-and-oesen]');

        getSlug('[Knöpfe & Ösen]', {
                custom: ['[', ']'],
                lang: 'de'
            })
            .should.eql('[knoepfe-und-oesen]');

        getSlug('[Knöpfe]', {
                maintainCase: true,
                custom: ['[', ']']
            })
            .should.eql('[Knoepfe]');

        getSlug('[Knöpfe haben Löcher]', {
                titleCase: true,
                custom: ['[', ']']
            })
            .should.eql('[Knoepfe-Haben-Loecher]');

        getSlug('[knöpfe haben runde löcher]', {
                titleCase: ['haben', 'runde'],
                custom: ['[', ']']
            })
            .should.eql('[Knoepfe-haben-runde-Loecher]');

        getSlug('[knöpfe haben runde löcher]', {
                titleCase: ['haben', 'runde'],
                maintainCase: true,
                custom: ['[', ']']
            })
            .should.eql('[Knoepfe-haben-runde-Loecher]');

        done();
    });

});