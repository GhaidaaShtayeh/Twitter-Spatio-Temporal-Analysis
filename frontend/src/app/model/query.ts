import { GeoPoint } from "./geo-point";

export class Query {
  keywords: string | null = null;
  start_date: string | null = null;
  end_date: string | null = null;
  coordinates: GeoPoint | null = null;
}
