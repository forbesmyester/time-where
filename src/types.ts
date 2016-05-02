export interface GoogVisit {
    timestampMs: string;
    latitudeE7: number;
    longitudeE7: number;
}

export interface TWVisit {
    date: Date;
    lat: number;
    lng: number;
}

export type Location = {
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
    name: Place
};

export type Place = String;
