
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, IndianRupee, Hospital, Building, X, ExternalLink } from 'lucide-react'; // Added ExternalLink
import { Skeleton } from "@/components/ui/skeleton";

// Define the structure for clinic data
export interface ClinicInfo {
  id: string;
  name: string;
  address: string;
  distance: string; // e.g., "2.5 km"
  estimatedCost: string; // e.g., "Free under PMJAY", "₹500 - ₹1500", "Govt. Rate"
  schemes: string[]; // e.g., ["PMJAY", "State Health Scheme"]
  isGovernment: boolean; // To prioritize government clinics
  website?: string; // Optional website link
  lat?: number; // Optional latitude for directions
  lon?: number; // Optional longitude for directions
}

interface ClinicResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinics: ClinicInfo[] | null; // Can be null initially or during error
  loading: boolean;
  error: string | null;
}

export function ClinicResultsModal({ isOpen, onClose, clinics, loading, error }: ClinicResultsModalProps) {

  // Sort clinics: Govt first, then by distance
  const sortedClinics = React.useMemo(() => {
    if (!clinics) return [];
    return [...clinics].sort((a, b) => {
      if (a.isGovernment !== b.isGovernment) {
        return a.isGovernment ? -1 : 1; // Govt clinics first
      }
      const distA = parseFloat(a.distance);
      const distB = parseFloat(b.distance);
      if (!isNaN(distA) && !isNaN(distB)) {
        return distA - distB; // Then sort by distance
      }
      return 0;
    });
  }, [clinics]);

  const getDirectionsUrl = (clinic: ClinicInfo) => {
      if (clinic.lat && clinic.lon) {
          return `https://www.google.com/maps/dir/?api=1&destination=${clinic.lat},${clinic.lon}`;
      }
      // Fallback to searching by name and address if lat/lon missing
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.name + ', ' + clinic.address)}`;
  }


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nearby Dermatology Clinics</DialogTitle>
          <DialogDescription>
            Showing potential clinics based on your location. Prioritizing government facilities.
             <span className="block text-xs text-muted-foreground mt-1">Always verify details directly with the clinic.</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-4 -mr-4">
          {loading && (
            <div className="space-y-4 p-4">
              {[...Array(3)].map((_, i) => (
                 <Card key={i} className="opacity-50">
                    <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                 </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-destructive">
              <p>Error finding clinics: {error}</p>
            </div>
          )}

          {!loading && !error && sortedClinics.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              <p>No clinics found for your location, or location access was denied.</p>
            </div>
          )}

          {!loading && !error && sortedClinics.length > 0 && (
            <div className="space-y-4 p-1">
              {sortedClinics.map((clinic) => (
                <Card key={clinic.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                     <div className="flex justify-between items-start gap-2">
                        <div className="flex-grow">
                            <CardTitle className="text-lg flex items-center gap-2 mb-1">
                               {clinic.isGovernment ? <Hospital className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" /> : <Building className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />}
                               <span>{clinic.name}</span>
                            </CardTitle>
                            <CardDescription className="text-xs flex items-center gap-1 pt-1">
                              <MapPin className="h-3 w-3 flex-shrink-0"/> <span>{clinic.address}</span>
                            </CardDescription>
                        </div>
                        {clinic.isGovernment && (
                           <Badge variant="secondary" className="ml-2 flex-shrink-0 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                               Govt.
                           </Badge>
                        )}
                     </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2 pt-0">
                     <div className="flex justify-between items-center text-xs">
                       <span className="font-medium text-muted-foreground">Distance:</span>
                       <span className="font-semibold">{clinic.distance}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                       <span className="font-medium text-muted-foreground flex items-center gap-1"><IndianRupee className="h-3 w-3"/> Est. Cost:</span>
                       <span className="text-right">{clinic.estimatedCost}</span>
                     </div>
                     {clinic.schemes.length > 0 && (
                       <div className="text-xs">
                         <span className="font-medium text-muted-foreground">Schemes: </span>
                         {clinic.schemes.map(scheme => (
                           <Badge key={scheme} variant="outline" className="mr-1 text-xs font-normal">{scheme}</Badge>
                         ))}
                       </div>
                     )}
                     <div className="flex justify-between items-center mt-2">
                        {clinic.website && (
                             <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto">
                               <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                 <Globe className="h-3 w-3" /> Visit Website
                               </a>
                             </Button>
                         )}
                         <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto">
                            <a href={getDirectionsUrl(clinic)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                <ExternalLink className="h-3 w-3" /> Get Directions
                            </a>
                         </Button>
                     </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
         <DialogClose asChild>
              <Button type="button" variant="outline" className="mt-4 w-full" onClick={onClose}>
                Close
              </Button>
         </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

