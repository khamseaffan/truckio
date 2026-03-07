export interface DriverPosition {
  driverId: string;
  jobId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface MapMarker {
  id: string;
  coordinate: { latitude: number; longitude: number };
  driverName: string;
  jobInfo: string;
}
