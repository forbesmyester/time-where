/// <reference path="../typings/main.d.ts" />
/// <reference path="../my-externals/typescript-ramda/ramda.d.ts" />

import * as T from "./types";
import * as R from "ramda";

export function convertGoogVisit(src: T.GoogVisit): T.Visit {
    return {
        date: new Date(Number(src.timestampMs)),
        lat: src.latitudeE7 / 10000000,
        lng: src.longitudeE7 / 10000000
    };
}

function numberSorter(a: number, b: number) { return a - b; }

function isVisitInLocation(v: T.Visit, l: T.Location): boolean {
    let lats = [l.lat1, l.lat2];
    let lngs = [l.lng1, l.lng2];
    lats.sort(numberSorter); lngs.sort(numberSorter);
    if (v.lat < lats[0]) { return false; }
    if (v.lat > lats[1]) { return false; }
    if (v.lng < lngs[0]) { return false; }
    if (v.lng > lngs[1]) { return false; }
    return true;
}

export function getWhere(interestedIn: T.Location[], v: T.Visit): [Date, T.Place[]] {
    let locs = interestedIn
        .filter(isVisitInLocation.bind(this, v))
        .map(({ name }) => name);
    return [v.date, locs];
}

export function chunkIntoDays(visits: T.Visit[]): [string, T.Visit[]][] {
    function getGroup(visit: T.Visit) {
        return visit.date.toISOString().replace(/T.*/, '');
    }
    return <[string, T.Visit[]][]>R.toPairs(R.groupBy(getGroup, visits));
}

function visitSorter(visit: T.Visit): number {
    return visit.date.getTime();
}

export function isCurrentStay(ts: Date) {
    return function(stay: T.Stay): boolean {
        if (
            (stay.start.getTime() <= ts.getTime()) &&
            (stay.end.getTime() >= ts.getTime())
        ) {
            return true;
        }
        return false;
    };
}

export function getDurations(stays: T.Stay[]): T.TimeAt[] {

    function mapper(stay: T.Stay): T.TimeAt {
        return [stay.place, stay.end.getTime() - stay.start.getTime()];
    }

    function reducer(acc: T.TimeAt[], ta: T.TimeAt): T.TimeAt[] {

        let index = R.findIndex(
            function(e) { return ta[0] === e[0]; },
            acc
        );

        if (index === -1) {
            acc.push(ta);
            return acc;
        }

        acc[index][1] = acc[index][1] + ta[1];
        return acc;
    }

    return R.reduce(reducer, [], R.map(mapper, stays));
}

export function getStays(locations: T.Location[], visits: T.Visit[]): T.Stay[] {

    function removeWhere(w: string) {
        return function(item: string): boolean { return item !== w; };
    }

    let lastLocations = <T.Place[]>[];

    let worker = (currentStays: T.Stay[], visit: T.Visit): T.Stay[] => {
        let wheres = getWhere(locations, visit)[1];
        let nextCurrentLocations = getWhere(locations, visit)[1];

        function tryAddStayToLastStays(stay: T.Stay): T.Stay {
            if (
                (wheres.indexOf(stay.place) > -1) &&
                (lastLocations.indexOf(stay.place) > -1)
            ) {
                wheres = R.filter(removeWhere(stay.place), wheres);
                stay.end = visit.date;
                stay.visits.push(visit);
            }
            return stay;
        }

        currentStays = R.map(tryAddStayToLastStays, currentStays);
        lastLocations = nextCurrentLocations;

        return R.reduce(
            function(acc: T.Stay[], place: T.Place) {
                acc.push({
                    start: visit.date,
                    end: visit.date,
                    place: place,
                    visits: [ visit ]
                });
                return acc;
            },
            currentStays,
            wheres
        );
    };

    return R.reduce(worker, [], R.sortBy(visitSorter, visits));
}

export function run(locations: T.Location[], { locations: googVisits }: { locations: T.GoogVisit[] }): [string, T.TimeAt[]][] {

    function mapper([day, data]: [string, T.Visit[]]): [string, T.TimeAt[]] {
        let retData = getDurations(getStays(locations, data));
        return [day, retData];
    }

    return R.map(
        mapper,
        chunkIntoDays(
            R.map(convertGoogVisit, googVisits)
        )
    );

}
