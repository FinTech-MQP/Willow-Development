import {
  VisionCardDataSource,
  VisionCardHTMLDataSource,
} from "../vision-property-card/property-card";

import {
  queryFeatures,
  IQueryFeaturesOptions,
  IQueryFeaturesResponse,
} from "@esri/arcgis-rest-feature-service";

import type { FloodZone, Parcel } from "database/generated/prisma-client";
import { ParcelPolygonAPIDataSource, ParcelPolygonDataSource } from "./parcelPolygon";
import { Feature } from "geojson";

const SQFT_PER_ACRE = 43560;

function correctZoneAbbreviation(zoneId: string): string {
  // M-.5 -> M-0.5
  const correctedZoneId = zoneId.replace("-.", "-0.");
  return correctedZoneId;
}

export interface ParcelDataSource {
  fetchParcel(parcelId: string, floodZone: FloodZone | undefined, parcelPolygon: Feature): Promise<Parcel | undefined>;
  fetchImages(parcelId: string): Promise<string[]>;
}

export class ParcelHTMLDataSource implements ParcelDataSource {
  cardSource: VisionCardDataSource = new VisionCardHTMLDataSource();
  parcelPolygonSource: ParcelPolygonDataSource = new ParcelPolygonAPIDataSource();

  async fetchParcel(parcelId: string, floodZone: FloodZone | undefined, parcelPolygon: Feature): Promise<Parcel | undefined> {
    // get data from card
    return await this.cardSource.fetchPage(parcelId).then(async ($) => {
      // if no page was found, return undefined
      if ($ === undefined) {
        return undefined;
      }

      let sqft = +$("#MainContent_lblLndSf").text();;

      return {
        id: parcelId,
        sqft: sqft,
        acres: sqft / SQFT_PER_ACRE,
        zoneId: correctZoneAbbreviation($("#MainContent_lblZone").text()),
        landUseId: $("#MainContent_lblUseCode").text(),
        polygonJSON: JSON.stringify(parcelPolygon.geometry),
        femaFloodZoneId: floodZone?.id || null,
      };
    });
  }
  async fetchImages(parcelId: string): Promise<string[]> {
    return await this.cardSource.fetchPage(parcelId).then(($) => {
      if ($ === undefined) return [];
      let result: string[] = [];
      $('a[id*="imgPhotoLink"]>img').each((i, e) => {
        let src = $(e).attr("src");
        if (src === undefined) return;
        result.push(src);
      });
      return result;
    });
  }
}
