import { SHIPPING_ZONES } from "./constants";

export function getShippingZones() {
    return SHIPPING_ZONES;
}

export function calculateShipping(zoneId) {
    const zone = SHIPPING_ZONES.find((z) => z.id === zoneId);
    return zone ? zone.price : 0;
}

export function getZoneName(zoneId) {
    const zone = SHIPPING_ZONES.find((z) => z.id === zoneId);
    return zone ? zone.name : "";
}
