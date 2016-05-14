import * as I from '../src/index';
import * as Types from '../src/types';
import {expect} from 'chai';

describe('Can', function() {

    it('convert a single location', function() {
        let r = I.convertGoogVisit({
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

    it('can slice into days', function()  {
        let data = [
            {
                date: new Date('1970-01-09T18:23:14.333Z'),
                lat: 51.4425,
                lng: -0.057
            },
            {
                date: new Date('1970-01-10T08:34:14.333Z'),
                lat: 51.4425,
                lng: -0.057
            },
            {
                date: new Date('1970-01-10T12:45:14.333Z'),
                lat: 51.4425,
                lng: -0.057
            },
            {
                date: new Date('1970-01-11T22:55:14.333Z'),
                lat: 51.4425, lng: -0.057
            },
        ];
        let expected = [
            [
                '1970-01-09',
                [{
                    date: new Date('1970-01-09T18:23:14.333Z'),
                    lat: 51.4425,
                    lng: -0.057
                }]
            ],
            [
                '1970-01-10',
                [
                    {
                        date: new Date('1970-01-10T08:34:14.333Z'),
                        lat: 51.4425,
                        lng: -0.057
                    },
                    {
                        date: new Date('1970-01-10T12:45:14.333Z'),
                        lat: 51.4425,
                        lng: -0.057
                    }
                ]
            ],
            [
                '1970-01-11',
                [{
                    date: new Date('1970-01-11T22:55:14.333Z'),
                    lat: 51.4425,
                    lng: -0.057
                }]
            ]
        ];
        expect(I.chunkIntoDays(data)).to.eql(expected);
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

        let rNearlyAtWork = I.getWhere(
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

        let rHome = I.getWhere(
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


    it('can find current stays', function() {
        let stays = <Types.Stay[]>[
            {
                start: new Date('1970-01-10T18:57:14.333Z'),
                end: new Date('1970-01-10T18:59:33.333Z'),
                place: 'Home',
                visits: []
            },
            {
                start: new Date('1970-01-10T19:23:14.333Z'),
                end: new Date('1970-01-10T19:33:33.333Z'),
                place: 'Work',
                visits: []
            }
        ];

        let filterer = I.isCurrentStay(
            new Date('1970-01-10T18:57:14.333Z')
        );

        expect(
            stays.filter(filterer)
        ).to.eql([stays[0]]);
    });

    it(
        'can analyze where you are and produce meaningful output',
        function() {

            let locations = [
                {
                    name: 'Work',
                    lat1: 51.41, lng1: -0.058,
                    lat2: 51.43, lng2: -0.056
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

            let visits = [
                {
                    date: new Date('1970-01-10T18:57:14.001Z'),
                    lat: 51.492,
                    lng: -0.057
                },
                {
                    date: new Date('1970-01-10T18:59:33.002Z'),
                    lat: 51.491,
                    lng: -0.057
                },
                {
                    date: new Date('1970-01-10T19:01:44.003Z'),
                    lat: 51.47,
                    lng: -0.057
                },
                {
                    date: new Date('1970-01-10T19:02:55.004Z'),
                    lat: 51.45,
                    lng: -0.057
                },
                {
                    date: new Date('1970-01-10T19:02:55.005Z'),
                    lat: 51.435,
                    lng: -0.057
                },
                {
                    date: new Date('1970-01-10T19:02:55.006Z'),
                    lat: 51.42,
                    lng: -0.057
                },
                {
                    date: new Date('1970-01-10T19:02:55.007Z'),
                    lat: 51.494,
                    lng: -0.057
                }
            ];

            let expected = [
                {
                    start: new Date('1970-01-10T18:57:14.001Z'),
                    end: new Date('1970-01-10T19:01:44.003Z'),
                    place: 'Home',
                    visits: [
                        {
                            date: new Date('1970-01-10T18:57:14.001Z'),
                            lat: 51.492,
                            lng: -0.057
                        },
                        {
                            date: new Date('1970-01-10T18:59:33.002Z'),
                            lat: 51.491,
                            lng: -0.057
                        },
                        {
                            date: new Date('1970-01-10T19:01:44.003Z'),
                            lat: 51.47,
                            lng: -0.057
                        }
                    ]
                },
                {
                    start: new Date('1970-01-10T19:01:44.003Z'),
                    end: new Date('1970-01-10T19:02:55.004Z'),
                    place: 'Commute',
                    visits: [
                        {
                            date: new Date('1970-01-10T19:01:44.003Z'),
                            lat: 51.47,
                            lng: -0.057
                        },
                        {
                            date: new Date('1970-01-10T19:02:55.004Z'),
                            lat: 51.45,
                            lng: -0.057
                        }
                    ]
                },
                {
                    start: new Date('1970-01-10T19:02:55.006Z'),
                    end: new Date('1970-01-10T19:02:55.006Z'),
                    place: 'Work',
                    visits: [
                        {
                            date: new Date('1970-01-10T19:02:55.006Z'),
                            lat: 51.42,
                            lng: -0.057
                        }
                    ]
                },
                {
                    start: new Date('1970-01-10T19:02:55.007Z'),
                    end: new Date('1970-01-10T19:02:55.007Z'),
                    place: 'Home',
                    visits: [
                        {
                            date: new Date('1970-01-10T19:02:55.007Z'),
                            lat: 51.494,
                            lng: -0.057
                        }
                    ]
                }
            ];

            expect(I.getStays(locations, visits)).to.eql(expected);
        }
    );

});
