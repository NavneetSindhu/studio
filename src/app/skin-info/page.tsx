
"use client";

import React, { useState, useMemo } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, HeartPulse, Activity, Droplet, Info, ShieldAlert, Check, X, Thermometer, Zap, Filter } from 'lucide-react'; // Import relevant icons
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";


// Define detailed information for common skin conditions
// Added Cure/Treatment, Dos/Don'ts, Severity
const skinConditionsData = [
  {
    id: 1,
    name: "Acne Vulgaris",
    icon: <Activity className="h-6 w-6 text-primary" />,
    symptoms: ["Pimples", "Blackheads", "Whiteheads", "Cysts", "Oily Skin"],
    causes: "Hair follicles plugged with oil and dead skin cells, bacteria (P. acnes), hormones, inflammation.",
    cureTreatment: "Topical treatments (benzoyl peroxide, retinoids), gentle cleansing, non-comedogenic products. Severe cases: oral antibiotics, isotretinoin (prescription needed).",
    dos: ["Cleanse gently twice daily", "Use non-comedogenic products", "Wash pillowcases regularly", "Consult dermatologist"],
    donts: ["Pick or squeeze pimples", "Use harsh scrubs", "Over-wash face", "Use oily cosmetics"],
    severity: "Mild to Severe", // Options: Mild, Moderate, Severe
  },
  {
    id: 2,
    name: "Eczema (Atopic Dermatitis)",
    icon: <Info className="h-6 w-6 text-primary" />,
    symptoms: ["Dry Skin", "Itching", "Redness", "Inflammation", "Blisters", "Oozing/Crusting"],
    causes: "Genetics, immune system dysfunction, environmental triggers (allergens, irritants), skin barrier defects.",
    cureTreatment: "Moisturizers (emollients), topical steroids, calcineurin inhibitors, antihistamines for itching, avoiding triggers. Biologics for severe cases.",
    dos: ["Moisturize frequently", "Use mild soaps", "Take lukewarm baths", "Identify and avoid triggers", "Wear soft fabrics"],
    donts: ["Scratch itchy skin", "Use hot water for bathing", "Use fragranced products", "Expose skin to known irritants"],
    severity: "Mild to Severe",
  },
  {
    id: 3,
    name: "Psoriasis",
    icon: <ShieldAlert className="h-6 w-6 text-primary" />,
    symptoms: ["Red Patches", "Silvery Scales", "Itching", "Dry Skin", "Joint Pain (sometimes)"],
    causes: "Autoimmune condition causing rapid skin cell turnover. Genetics and environmental triggers involved.",
    cureTreatment: "Topical treatments (corticosteroids, Vitamin D analogs), phototherapy, systemic medications (methotrexate, biologics). Managed by dermatologist.",
    dos: ["Moisturize regularly", "Manage stress", "Follow treatment plan", "Protect skin from injury"],
    donts: ["Scratch or pick scales", "Take long hot showers", "Consume excessive alcohol", "Stop treatment abruptly"],
    severity: "Mild to Severe",
  },
   {
    id: 4,
    name: "Vitiligo",
    icon: <Droplet className="h-6 w-6 text-primary" />,
    symptoms: ["White Patches", "Loss of Skin Color", "Hair Whitening"],
    causes: "Autoimmune condition attacking pigment cells (melanocytes). Genetic predisposition, triggers like stress or sunburn.",
    cureTreatment: "No cure, but treatments aim to restore color: topical steroids, phototherapy, JAK inhibitors, skin grafting, camouflage makeup. Sun protection is vital.",
    dos: ["Use sunscreen daily", "Consider cosmetic camouflage", "Seek emotional support", "Discuss treatment options with dermatologist"],
    donts: ["Get sunburned", "Get tattoos in affected areas (risk of spread)", "Use tanning beds"],
    severity: "Varies", // Severity is less about danger, more about extent
  },
  {
    id: 5,
    name: "Melanoma",
    icon: <AlertCircle className="h-6 w-6 text-destructive" />,
    symptoms: ["New Mole", "Changing Mole", "Asymmetry", "Irregular Border", "Color Variation", "Diameter >6mm", "Evolving"],
    causes: "UV radiation damage (sun/tanning beds), genetics.",
    cureTreatment: "URGENT: Surgical removal. Further therapy (immunotherapy, targeted therapy) depends on stage. Early detection is critical.",
    dos: ["See a dermatologist IMMEDIATELY if suspected", "Perform regular self-skin checks", "Use broad-spectrum sunscreen", "Wear protective clothing"],
    donts: ["Ignore suspicious moles", "Use tanning beds", "Get excessive sun exposure"],
    severity: "Severe", // Potentially life-threatening
  },
  {
    id: 6,
    name: "Rosacea",
    icon: <HeartPulse className="h-6 w-6 text-primary" />,
    symptoms: ["Facial Redness", "Flushing", "Visible Blood Vessels", "Bumps/Pimples", "Eye Irritation"],
    causes: "Unknown; genetic, environmental, inflammatory factors. Triggers: sun, heat, spicy food, alcohol.",
    cureTreatment: "Avoid triggers, gentle skincare, sun protection, topical/oral medications (metronidazole, azelaic acid, antibiotics), laser therapy.",
    dos: ["Identify and avoid triggers", "Use gentle cleansers", "Apply sunscreen daily", "Use prescribed medications"],
    donts: ["Use harsh exfoliants", "Consume known triggers", "Rub face vigorously"],
    severity: "Mild to Moderate",
  },
   {
    id: 7,
    name: "Seborrheic Dermatitis",
    icon: <Activity className="h-6 w-6 text-primary" />,
    symptoms: ["Flaking", "Yellowish Scales", "Red Skin", "Itching", "Dandruff (on scalp)"],
    causes: "Likely yeast (Malassezia) on skin + inflammatory response.",
    cureTreatment: "Medicated shampoos (ketoconazole, selenium sulfide), topical antifungals, mild corticosteroids.",
    dos: ["Use medicated shampoos regularly", "Manage stress", "Cleanse affected areas gently"],
    donts: ["Use oily hair products", "Scratch excessively"],
    severity: "Mild to Moderate",
  },
   {
    id: 8,
    name: "Actinic Keratosis (AK)",
     icon: <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
    symptoms: ["Rough Patch", "Scaly Patch", "Sun-Exposed Areas"],
    causes: "Prolonged UV exposure.",
    cureTreatment: "Dermatologist evaluation needed. Treatments: cryotherapy, topical creams (5-FU, imiquimod), photodynamic therapy. Considered precancerous.",
    dos: ["See dermatologist for evaluation", "Use sun protection consistently", "Monitor skin for changes"],
    donts: ["Ignore rough, persistent patches", "Get excessive sun exposure"],
    severity: "Moderate", // Pre-cancerous
  },
   {
    id: 9,
    name: "Contact Dermatitis",
     icon: <ShieldAlert className="h-6 w-6 text-primary" />,
    symptoms: ["Red Rash", "Itching", "Blisters", "Oozing", "Defined Borders (sometimes)"],
    causes: "Direct contact with irritants (soaps, chemicals) or allergens (poison ivy, nickel, fragrances).",
    cureTreatment: "Identify and avoid the cause. Wash affected skin. Topical corticosteroids, cool compresses, antihistamines.",
    dos: ["Identify and avoid the trigger", "Wash skin after contact", "Use barrier creams if needed", "Patch test if allergen suspected"],
    donts: ["Continue exposure to the irritant/allergen", "Scratch the rash"],
    severity: "Mild to Moderate",
  },
   {
    id: 10,
    name: "Hives (Urticaria)",
     icon: <Zap className="h-6 w-6 text-primary" />, // Changed icon
    symptoms: ["Raised Welts", "Itchy Welts (Wheals)", "Redness", "Sudden Onset"],
    causes: "Allergic reactions (food, meds), infections, stress, physical stimuli. Often unknown.",
    cureTreatment: "Antihistamines. Avoid known triggers. Cool compresses. See doctor for severe/persistent cases or if breathing affected.",
    dos: ["Take antihistamines", "Identify and avoid triggers", "Apply cool compresses", "Seek medical help if severe"],
    donts: ["Scratch the hives", "Take hot baths/showers"],
    severity: "Mild to Moderate", // Can be severe if angioedema/anaphylaxis occurs
  },
];

// --- Helper Function to get Severity Badge Color ---
const getSeverityBadgeVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity?.toLowerCase()) {
        case 'severe': return 'destructive';
        case 'moderate': return 'default'; // Using primary color for moderate
        case 'mild': return 'secondary';
        default: return 'outline';
    }
};

// --- Main Page Component ---
export default function SkinInfoPage() {
    const [symptomFilter, setSymptomFilter] = useState<string>('all');
    const [severityFilter, setSeverityFilter] = useState<string>('all');

    // --- Get unique symptoms for filter dropdown ---
    const allSymptoms = useMemo(() => {
        const symptomsSet = new Set<string>();
        skinConditionsData.forEach(condition => {
            condition.symptoms.forEach(symptom => symptomsSet.add(symptom));
        });
        return Array.from(symptomsSet).sort();
    }, []);

    // --- Get unique severities for filter dropdown ---
    const allSeverities = useMemo(() => {
        const severitiesSet = new Set<string>();
        skinConditionsData.forEach(condition => severitiesSet.add(condition.severity));
        return Array.from(severitiesSet).sort((a, b) => { // Custom sort order
            const order = { Mild: 1, Moderate: 2, Varies: 3, Severe: 4 };
            return (order[a] || 99) - (order[b] || 99);
        });
    }, []);

    // --- Filtered conditions based on selected filters ---
    const filteredConditions = useMemo(() => {
        return skinConditionsData.filter(condition => {
            const symptomMatch = symptomFilter === 'all' || condition.symptoms.some(s => s.toLowerCase() === symptomFilter.toLowerCase());
            const severityMatch = severityFilter === 'all' || condition.severity.toLowerCase() === severityFilter.toLowerCase();
            return symptomMatch && severityMatch;
        });
    }, [symptomFilter, severityFilter]);


  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground">
        {/* Consistent Header */}
        <nav className="w-full py-2 bg-card shadow-sm sticky top-0 z-50 border-b">
            <div className="container mx-auto flex items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-primary hover:opacity-90 transition-opacity">
                    <HeartPulse className="h-6 w-6" />
                    <span>SkinDeep AI</span>
                </Link>
                <div className="flex items-center space-x-1 md:space-x-2">
                    <Button variant="ghost" asChild size="sm">
                        <Link href="/" className="text-sm">Home</Link>
                    </Button>
                     <span className="text-muted-foreground/30 hidden md:inline">|</span>
                     <Button variant="ghost" disabled size="sm">
                         <span className="text-sm font-semibold">Skin Disease Info</span>
                     </Button>
                     <div className="flex items-center space-x-1 pl-2 border-l border-border ml-2">
                         <LanguageToggle />
                         <ThemeToggle />
                     </div>
                     {/* Mobile Menu Trigger (placeholder) */}
                     <div className="md:hidden">
                         <Button variant="ghost" size="icon">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                         </Button>
                     </div>
                </div>
            </div>
        </nav>

      <main className="container mx-auto px-4 py-12 flex-grow w-full">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3">Skin Disease Information</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Learn about common skin conditions, their symptoms, causes, and general care.
            </p>
              <Alert variant="default" className="mt-6 max-w-2xl mx-auto text-left bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400">
                <Info className="h-4 w-4"/>
                <AlertTitle className="font-semibold">Consult a Professional</AlertTitle>
                <AlertDescription>
                   This information is for educational purposes only and not a substitute for medical advice. Always consult a qualified dermatologist for diagnosis and treatment.
                </AlertDescription>
             </Alert>
        </div>

         {/* Filter Section */}
        <div className="mb-8 p-4 bg-card border rounded-lg shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-center">
             <Filter className="h-5 w-5 text-muted-foreground hidden sm:block"/>
             <span className="font-medium mr-2 hidden sm:block">Filter by:</span>
             <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
                <div className="flex-1">
                     <Select value={symptomFilter} onValueChange={setSymptomFilter}>
                       <SelectTrigger className="w-full sm:w-[200px]">
                         <SelectValue placeholder="Filter by Symptom" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="all">All Symptoms</SelectItem>
                         {allSymptoms.map(symptom => (
                           <SelectItem key={symptom} value={symptom}>{symptom}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                 </div>
                <div className="flex-1">
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        {allSeverities.map(severity => (
                          <SelectItem key={severity} value={severity}>{severity}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                 </div>
             </div>
        </div>

        {/* Disease Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConditions.length > 0 ? (
              filteredConditions.map((condition) => (
                <Card key={condition.id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center space-x-3">
                            {condition.icon}
                            <CardTitle className="text-xl">{condition.name}</CardTitle>
                         </div>
                         <Badge variant={getSeverityBadgeVariant(condition.severity)} className="capitalize">
                             <Thermometer className="h-3 w-3 mr-1" /> {condition.severity}
                         </Badge>
                    </div>
                    <CardDescription className="text-xs pt-1">Common Symptoms: {condition.symptoms.join(', ')}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4 text-sm">
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Potential Causes:</h3>
                      <p className="text-foreground/90">{condition.causes}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Cure / Treatment:</h3>
                      <p className="text-foreground/90">{condition.cureTreatment}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                           <h4 className="font-semibold text-green-600 dark:text-green-400 mb-1 flex items-center"><Check className="h-4 w-4 mr-1"/> Do's:</h4>
                           <ul className="list-disc list-inside space-y-0.5 text-xs text-foreground/80 pl-2">
                               {condition.dos.map((item, index) => <li key={index}>{item}</li>)}
                           </ul>
                        </div>
                         <div>
                           <h4 className="font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center"><X className="h-4 w-4 mr-1"/> Don'ts:</h4>
                            <ul className="list-disc list-inside space-y-0.5 text-xs text-foreground/80 pl-2">
                                {condition.donts.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        </div>
                     </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-10">
                  <p className="text-muted-foreground">No conditions match the selected filters.</p>
              </div>
            )
          }
        </div>
      </main>

      {/* Consistent Footer */}
      <footer className="w-full py-8 bg-card text-muted-foreground border-t mt-16">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 text-center md:text-left">
          <div className="text-xs mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} SkinDeep AI. All Rights Reserved. <br/>
            <span className="text-destructive font-semibold">Disclaimer: Educational information only. Not medical advice.</span>
          </div>
          <div className="flex space-x-4">
            <Link href="/privacy" className="hover:text-primary text-xs">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary text-xs">Terms of Service</Link>
            <Link href="mailto:support@skindeepai.example.com" className="hover:text-primary text-xs">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
