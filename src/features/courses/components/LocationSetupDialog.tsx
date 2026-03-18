/**
 * Location Setup Dialog (Geofencing configuration).
 * Replaces old LocationSetupDialog.js.
 * Integrates @react-google-maps/api to set coordinate boundaries for session check-ins.
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Circle,
} from "@react-google-maps/api";
import { Loader2, Search, MapPin } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Define the libraries array outside the component to avoid infinite re-renders in useJsApiLoader
const LIBRARIES: ("places" | "geometry" | "drawing" | "visualization")[] = [
  "places",
];

// Module-level singleton: lock the Google Maps language to whatever i18n reports
// on the very first render of LocationSetupDialog. The Maps JS API loader can
// only be initialised once per page — any subsequent call with a different
// `language` throws "Loader must not be called again with different options".
// A React.useRef is NOT enough because each remount creates a new ref value.
let _mapsLanguageLock: string | null = null;

interface LocationData {
  latLng: { lat: number; lng: number };
  locationText: string;
}

interface LocationSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLocation?: LocationData | null;
  onSave: (data: LocationData) => void;
}

const DEFAULT_CENTER = { lat: 31.7683, lng: 35.2137 }; // Jerusalem fallback

export function LocationSetupDialog({
  open,
  onOpenChange,
  initialLocation,
  onSave,
}: LocationSetupDialogProps) {
  const { t, i18n } = useTranslation();

  // The old app used a custom `config.googleMapsApi.MAPS_API_KEY`.
  // In our Vite setup, we use environment variables.
  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

   // Lock the Maps language on the very first render across all mounts.
  if (!_mapsLanguageLock) {
    _mapsLanguageLock = i18n.language || "en";
  }

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: API_KEY,
    libraries: LIBRARIES,
    language: _mapsLanguageLock,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [locationText, setLocationText] = useState(
    initialLocation?.locationText || "",
  );
  const [latLng, setLatLng] = useState(initialLocation?.latLng || null);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from local storage if no initial location provided (mimics legacy behavior)
  useEffect(() => {
    if (open && !initialLocation) {
      try {
        const stored = localStorage.getItem("_locationData_");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.latLng) {
            setLatLng(parsed.latLng);
            setLocationText(parsed.locationText || "");
          }
        }
      } catch (err) {
        console.error("Failed to parse local storage location", err);
      }
    }
  }, [open, initialLocation]);

  const onLoad = useCallback(
    (m: google.maps.Map) => {
      setMap(m);
      if (latLng) {
        m.setCenter(latLng);
        m.setZoom(16);
      }
    },
    [latLng],
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setLatLng({ lat, lng });

    // Reverse geocode
    if (isLoaded && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          setLocationText(results[0].formatted_address);
        } else {
          setLocationText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });
    }
  };

  const executeSearch = () => {
    if (!locationText.trim() || !isLoaded || !window.google) return;

    // Check if input is coordinates "lat, lng"
    const split = locationText.split(",");
    if (
      split.length === 2 &&
      !isNaN(parseFloat(split[0])) &&
      !isNaN(parseFloat(split[1]))
    ) {
      const lat = parseFloat(split[0].trim());
      const lng = parseFloat(split[1].trim());
      setLatLng({ lat, lng });
      map?.panTo({ lat, lng });
      map?.setZoom(16);
      return;
    }

    // Geocode address
    setLoading(true);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: locationText }, (results, status) => {
      setLoading(false);
      if (status === "OK" && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        setLatLng({ lat, lng });
        setLocationText(results[0].formatted_address);
        map?.panTo({ lat, lng });
        map?.setZoom(16);
      }
    });
  };

  const onLocationTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationText(e.target.value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    // Auto search after 1.5 seconds of typing
    searchTimeoutRef.current = setTimeout(() => {
      executeSearch();
    }, 1500);
  };

  const handleSetMyLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatLng({ lat, lng });
        map?.panTo({ lat, lng });
        map?.setZoom(16);

        // Reverse geocode
        if (isLoaded && window.google) {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              setLocationText(results[0].formatted_address);
            } else {
              setLocationText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
          });
        }
      },
      () => {
        setLoading(false);
      },
    );
  };

  const handleSave = () => {
    if (latLng) {
      const data: LocationData = { latLng, locationText };
      localStorage.setItem("_locationData_", JSON.stringify(data));
      onSave(data);
      onOpenChange(false);
    }
  };

  if (!API_KEY && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Setup Location</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center text-red-600">
            Missing Google Maps API Key. Please configure VITE_GOOGLE_MAPS_KEY
            in your environment.
          </div>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[85vh] flex flex-col p-0">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {t("setup location - title") || "Setup check-in location"}
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-2">
              {t("setup location - description") ||
                "Attendees will only be able to check-in when they are physically inside the location radius."}
            </p>
          </DialogHeader>

          <div className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Input
                value={locationText}
                onChange={onLocationTextChange}
                placeholder={
                  t("setup location - location input placeholder") ||
                  "Enter address or coordinates (lat, lng)..."
                }
                className="pr-10"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (searchTimeoutRef.current)
                      clearTimeout(searchTimeoutRef.current);
                    executeSearch();
                  }
                }}
              />
            </div>
            <Button
              variant="secondary"
              onClick={executeSearch}
              disabled={loading || !locationText}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex-1 relative bg-gray-100 min-h-[300px]">
          {loadError ? (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 p-6 text-center">
              Map failed to load. Please check your API key and network
              connection.
            </div>
          ) : !isLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">Loading Map...</span>
            </div>
          ) : (
            <>
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={latLng || DEFAULT_CENTER}
                zoom={14}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                {latLng && (
                  <>
                    <Marker position={latLng} />
                    <Circle
                      center={latLng}
                      radius={100} // 100 meters matching legacy app
                      options={{
                        fillColor: "#7a9df3",
                        fillOpacity: 0.35,
                        strokeWeight: 0,
                        clickable: false,
                      }}
                    />
                  </>
                )}
              </GoogleMap>

              <Button
                size="sm"
                className="absolute bottom-6 left-6 shadow-md bg-white text-black hover:bg-gray-100"
                onClick={handleSetMyLocation}
                disabled={loading}
              >
                <MapPin className="w-4 h-4 mr-2 text-link" />
                My Location
              </Button>
            </>
          )}
        </div>

        <div className="p-6 pt-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-500 max-w-[60%]">
            {t("setup location - map explain bottom") ||
              "You can click anywhere on the map to set the center of the check-in area. The blue circle illustrates the 100m valid check-in radius."}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-[#333] hover:bg-gray-100">
              {t("general - cancel") || "Cancel"}
            </Button>
            <Button
              className="bg-link hover:bg-link/90 text-white"
              onClick={handleSave}
              disabled={!latLng}
            >
              {t("general - save") || "Save Location"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
