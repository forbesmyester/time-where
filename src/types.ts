export interface GoogVisit {
    timestampMs: string;
    latitudeE7: number;
    longitudeE7: number;
}

export interface Visit {
    date: Date;
    lat: number;
    lng: number;
}

export type Location = {
    lat1: number;
    lng1: number;
    lat2: number;
    lng2: number;
    name: Place;
};

export type Stay = {
    start: Date;
    end: Date;
    place: Place;
    visits: Visit[];
};

export type Place = string;
