import React, { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Search, Phone, Globe, Navigation, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
const hasValidKey = Boolean(API_KEY);

interface Office {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: google.maps.LatLngLiteral;
  phoneNumber?: string;
  websiteUri?: string;
}

export default function Locations() {
  const [searchQuery, setSearchQuery] = useState("Pegadaian");
  const [offices, setOffices] = useState<Office[]>([
    {
      id: "sample-1",
      displayName: "Pegadaian Kantor Pusat",
      formattedAddress: "Jl. Kramat Raya No.162, RW.4, Kenari, Kec. Senen, Jakarta Pusat",
      location: { lat: -6.1847, lng: 106.8444 },
      phoneNumber: "021-3155550",
      websiteUri: "https://www.pegadaian.co.id"
    },
    {
      id: "sample-2",
      displayName: "Pegadaian Cabang Jakarta Pusat",
      formattedAddress: "Jl. Salemba Raya No.2, RW.3, Paseban, Kec. Senen, Jakarta Pusat",
      location: { lat: -6.1912, lng: 106.8512 },
      phoneNumber: "021-3909503"
    }
  ]);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!hasValidKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="bg-amber-50 p-4 rounded-2xl mb-6">
          <MapPin className="w-12 h-12 text-amber-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4">Google Maps API Key Diperlukan</h2>
        <p className="text-slate-500 max-w-md mb-8 font-medium">
          Fitur pencarian kantor Pegadaian memerlukan API Key Google Maps yang valid.
        </p>
        <div className="bg-slate-50 p-6 rounded-2xl text-left text-sm space-y-3 border border-slate-100">
          <p className="font-bold text-slate-700">Cara menambahkan API Key:</p>
          <ol className="list-decimal pl-4 space-y-2 text-slate-600 font-medium">
            <li>Dapatkan API Key dari <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Google Cloud Console</a>.</li>
            <li>Klik ikon ⚙️ <strong>Settings</strong> di pojok kanan atas AI Studio.</li>
            <li>Pilih <strong>Secrets</strong>.</li>
            <li>Tambahkan secret dengan nama <code>GOOGLE_MAPS_PLATFORM_KEY</code> dan tempel key Anda.</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Kantor Pegadaian</h1>
            <p className="text-slate-500 font-medium">Temukan cabang Pegadaian terdekat untuk setoran fisik atau konsultasi.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Cari lokasi (Kota, Daerah...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/30 transition-all font-medium shadow-sm"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[70vh]">
          <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            <OfficeSearch 
              query={searchQuery} 
              onResults={setOffices} 
              setIsLoading={setIsLoading} 
            />
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="font-bold text-xs uppercase tracking-widest">Mencari...</p>
              </div>
            ) : offices.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-tight">Tidak ada kantor ditemukan</p>
              </div>
            ) : (
              offices.map(office => (
                <motion.button
                  key={office.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedOffice(office)}
                  className={cn(
                    "flex flex-col p-5 bg-white rounded-3xl text-left transition-all border-2",
                    selectedOffice?.id === office.id 
                      ? "border-primary shadow-lg shadow-primary/10" 
                      : "border-slate-50 hover:border-slate-200"
                  )}
                >
                  <h3 className="font-black text-slate-900 mb-1">{office.displayName}</h3>
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{office.formattedAddress}</p>
                  
                  <div className="flex items-center gap-2 mt-auto">
                    {office.phoneNumber && (
                      <div className="bg-slate-50 p-2 rounded-lg text-slate-400">
                         <Phone className="w-4 h-4" />
                      </div>
                    )}
                    <div className="ml-auto flex items-center gap-1 text-primary text-xs font-black uppercase tracking-widest">
                       Buka Peta <Navigation className="w-3 h-3" />
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>

          <div className="lg:col-span-2 relative h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white">
            <Map
              defaultCenter={{ lat: -6.2088, lng: 106.8456 }} // Jakarta center
              defaultZoom={12}
              mapId="PAGADAIAN_LOCATOR"
              style={{ width: '100%', height: '100%' }}
              center={selectedOffice?.location}
              onCameraChanged={() => {}}
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            >
               {offices.map(office => (
                 <OfficeMarker 
                   key={office.id} 
                   office={office} 
                   isSelected={selectedOffice?.id === office.id}
                   onClick={() => setSelectedOffice(office)}
                 />
               ))}
            </Map>
          </div>
        </div>
      </div>
    </APIProvider>
  );
}

function OfficeSearch({ query, onResults, setIsLoading }: { 
  query: string, 
  onResults: (offices: Office[]) => void,
  setIsLoading: (loading: boolean) => void
}) {
  const placesLib = useMapsLibrary('places');
  const map = useMap();

  useEffect(() => {
    if (!placesLib || !query || query.length < 3) return;

    const searchTimeout = setTimeout(() => {
      setIsLoading(true);
      placesLib.Place.searchByText({
        textQuery: query.toLowerCase().includes("pegadaian") ? query : `Pegadaian ${query}`,
        fields: ['id', 'displayName', 'location', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI'],
        locationBias: map?.getCenter() || { lat: -6.2, lng: 106.8 },
        maxResultCount: 15,
      }).then(({ places }) => {
        const mappedOffices = places.map(p => ({
          id: p.id!,
          displayName: p.displayName!,
          formattedAddress: p.formattedAddress!,
          location: p.location?.toJSON() as google.maps.LatLngLiteral,
          phoneNumber: p.nationalPhoneNumber,
          websiteUri: p.websiteURI
        }));
        onResults(mappedOffices);
        setIsLoading(false);

        // Fit map bounds if results exist
        if (mappedOffices.length > 0 && map) {
          const bounds = new google.maps.LatLngBounds();
          mappedOffices.forEach(o => bounds.extend(o.location));
          map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
        }
      }).catch(err => {
        console.error("Place search error:", err);
        setIsLoading(false);
      });
    }, 800);

    return () => clearTimeout(searchTimeout);
  }, [placesLib, query, map]);

  return null;
}

function OfficeMarker({ office, isSelected, onClick }: { 
  office: Office, 
  isSelected: boolean,
  onClick: () => void,
  key?: React.Key
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  useEffect(() => {
    if (isSelected) {
      setIsInfoOpen(true);
    }
  }, [isSelected]);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={office.location}
        onClick={() => {
          onClick();
          setIsInfoOpen(true);
        }}
      >
        <Pin 
          background={isSelected ? "#2ecc71" : "#fff"} 
          glyphColor={isSelected ? "#fff" : "#2ecc71"} 
          borderColor="#2ecc71"
          scale={isSelected ? 1.2 : 1}
        />
      </AdvancedMarker>

      {isInfoOpen && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => {
            setIsInfoOpen(false);
            if (isSelected) onClick(); // Clear selection or keep it?
          }}
          className="rounded-2xl"
        >
          <div className="p-2 max-w-[200px]">
             <h3 className="font-black text-slate-900 text-sm mb-1">{office.displayName}</h3>
             <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">{office.formattedAddress}</p>
             <div className="flex flex-col gap-2">
                {office.phoneNumber && (
                  <a href={`tel:${office.phoneNumber}`} className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Phone className="w-3 h-3" /> {office.phoneNumber}
                  </a>
                )}
                {office.websiteUri && (
                  <a href={office.websiteUri} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Globe className="w-3 h-3" /> Website
                  </a>
                )}
             </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
