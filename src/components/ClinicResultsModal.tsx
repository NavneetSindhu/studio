
"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, IndianRupee, Hospital, Building, X } from 'lucide-react'; // Added Hospital, Building icons
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

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
}

interface ClinicResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinics: ClinicInfo[] | null; // Can be null initially or during error
  loading: boolean;
  error: string | null;
}

export function ClinicResultsModal({ isOpen, onClose, clinics, loading, error }: ClinicResultsModalProps) {

  // Sort clinics to prioritize government ones
  const sortedClinics = React.useMemo(() => {
    if (!clinics) return [];
    return [...clinics].sort((a, b) => {
      // Sort by government status first (true comes before false)
      if (a.isGovernment !== b.isGovernment) {
        return a.isGovernment ? -1 : 1;
      }
      // Then sort by distance (assuming distance is like "X km", convert to number)
      const distA = parseFloat(a.distance);
      const distB = parseFloat(b.distance);
      if (!isNaN(distA) && !isNaN(distB)) {
        return distA - distB;
      }
      return 0; // Fallback if distance parsing fails
    });
  }, [clinics]);


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
                     <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center gap-2">
                           {clinic.isGovernment ? <Hospital className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : <Building className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                           {clinic.name}
                        </CardTitle>
                        {clinic.isGovernment && (
                           <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                               Government
                           </Badge>
                        )}
                     </div>
                     <CardDescription className="text-xs flex items-center gap-1 pt-1">
                       <MapPin className="h-3 w-3"/> {clinic.address}
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                     <div className="flex justify-between items-center text-xs">
                       <span className="font-medium">Distance:</span>
                       <span>{clinic.distance}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                       <span className="font-medium flex items-center gap-1"><IndianRupee className="h-3 w-3"/> Est. Cost:</span>
                       <span>{clinic.estimatedCost}</span>
                     </div>
                     {clinic.schemes.length > 0 && (
                       <div className="text-xs">
                         <span className="font-medium">Schemes: </span>
                         {clinic.schemes.map(scheme => (
                           <Badge key={scheme} variant="outline" className="mr-1 text-xs">{scheme}</Badge>
                         ))}
                       </div>
                     )}
                     {clinic.website && (
                         <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto">
                           <a href={clinic.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                             <Globe className="h-3 w-3" /> Visit Website
                           </a>
                         </Button>
                     )}
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

         {/* Close button for accessibility/fallback */}
         {/* <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
             <X className="h-4 w-4" />
             <span className="sr-only">Close</span>
         </DialogClose> */}
      </DialogContent>
    </Dialog>
  );
}
