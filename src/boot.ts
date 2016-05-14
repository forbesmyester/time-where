/// <reference path="../typings/main.d.ts" />

import * as I from './index';
import * as T from "./types";
import { map } from "ramda";
import { readFileSync } from 'fs';


let googData = JSON.parse(
    <string>readFileSync('./LocationHistory.json', {encoding: 'utf8'})
);

let locations = [
    // {
    //     name: 'Home',
    //     lat1: 51.441483072303946, lng1: -0.058262944221496575,
    //     lat2: 51.44281050775324, lng2: -0.05610108375549316
    // },
    {
        name: 'Work',
        lat1: 51.523374017036076, lng1: -0.10573267936706543,
        lat2: 51.52438199604448, lng2: -0.1040428876876831
    }
];

let totalH = 0;
let totalC = 0;

function presenter(report: [string, T.TimeAt[]][]): [string, T.TimeAt[]][] {
    return map(
        function([day, timeAts]): [string, T.TimeAt[]] {
            return [day, map(
                function([l, t]): T.TimeAt {
                    let h = t / (1000 * 60 * 60);
                    if (h > 6) {
                        totalC = totalC + 1;
                        totalH = totalH + h;
                    }
                    return [l, h];
                },
                timeAts
            )];
        },
        report
    );
}

let out = presenter(I.run(locations, googData));

console.log(JSON.stringify(out.reverse()));
console.log (">>> ", totalH / totalC);
