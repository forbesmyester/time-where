import * as I from '../src/index';
import * as Types from '../src/types';
import {expect} from 'chai';

describe('Can', function() {

    it('convert a single location', function() {
        let r = I.convertVisit({
            latitudeE7: 514425000,
            longitudeE7: -570000,
            timestampMs: "845834333"
        });
        expect(r).to.eql({
            date: new Date('1970-01-10T18:57:14.333Z'),
            lat: 51.4425,
            lng: -0.057
        });
    });

    it('Get the locations someone is at at times', function() {
        let locations = [
            {
                name: 'Work',
                lat1: 51.42, lng1: -0.058,
                lat2: 51.46, lng2: -0.056
            },
            {
                name: 'Commute',
                lat1: 51.44, lng1: -0.058,
                lat2: 51.48, lng2: -0.056
            },
            {
                name: 'Home',
                lat1: 51.46, lng1: -0.058,
                lat2: 51.50, lng2: -0.056
            },
        ];

        let rNearlyAtWork = I.getVisitList(
            locations,
            {
                date: new Date('1970-01-10T18:57:14.333Z'),
                lat: 51.4425,
                lng: -0.057
            }
        );
        expect(rNearlyAtWork).to.eql([
            new Date('1970-01-10T18:57:14.333Z'),
            ['Work', 'Commute']
        ]);

        let rHome = I.getVisitList(
            locations,
            {
                date: new Date('1970-01-10T18:57:14.333Z'),
                lat: 51.49,
                lng: -0.057
            }
        );
        expect(rHome).to.eql([
            new Date('1970-01-10T18:57:14.333Z'),
            ['Home']
        ]);
    });

});
