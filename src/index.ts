/// <reference path="../typings/main.d.ts" />
/// <reference path="../my-externals/typescript-ramda/ramda.d.ts" />

import * as T from "./types.ts";
import * as R from "ramda";

export function convertVisit(src: T.GoogVisit): T.TWVisit {
    return {
        date: new Date(Number(src.timestampMs)),
        lat: src.latitudeE7 / 10000000,
        lng: src.longitudeE7 / 10000000
    };
}

function numberSorter(a: number, b: number) { return a - b; }

function isVisitInLocation(v: T.TWVisit, l: T.Location): boolean {
    let lats = [l.lat1, l.lat2];
    let lngs = [l.lng1, l.lng2];
    lats.sort(numberSorter); lngs.sort(numberSorter);
    if (v.lat < lats[0]) { return false; }
    if (v.lat > lats[1]) { return false; }
    if (v.lng < lngs[0]) { return false; }
    if (v.lng > lngs[1]) { return false; }
    return true;
}

export function getVisitList(interestedIn: T.Location[], v: T.TWVisit): [Date, T.Place[]] {
    let locs = interestedIn
        .filter(isVisitInLocation.bind(this, v))
        .map(({ name }) => name);
    return [v.date, locs];
}

export function chunkIntoDays(visits: T.TWVisit[]): [string, T.TWVisit[]][] {
    function getGroup(visit: T.TWVisit) {
        return visit.date.toISOString().replace(/T.*/, '');
    }
    return <[string, T.TWVisit[]][]>R.toPairs(R.groupBy(getGroup, visits));
}
