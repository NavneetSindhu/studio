
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, HeartPulse, Activity, Droplet, Info, ShieldAlert } from 'lucide-react'; // Import relevant icons
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Define detailed information for common skin conditions
const skinConditionsInfo = [
  {
    name: "Acne Vulgaris",
    icon: <Activity className="h-6 w-6 text-primary" />,
    symptoms: "Includes pimples (papules, pustules), blackheads, whiteheads, cysts, and nodules. Often appears on the face, neck, chest, back, and shoulders.",
    causes: "Caused by hair follicles becoming plugged with oil and dead skin cells. Factors include hormones, bacteria (P. acnes), inflammation, genetics, and certain medications.",
    careTips: "Use gentle cleansers, avoid harsh scrubbing, use non-comedogenic products, topical treatments (benzoyl peroxide, salicylic acid, retinoids), and consult a dermatologist for persistent or severe cases (antibiotics, isotretinoin).",
  },
  {
    name: "Eczema (Atopic Dermatitis)",
    icon: <Info className="h-6 w-6 text-primary" />,
    symptoms: "Dry, itchy, red, and inflamed skin. May include small bumps, oozing, crusting, or thickened skin (lichenification). Common in skin folds.",
    causes: "Complex interaction of genetics, immune system dysfunction, environmental triggers (allergens, irritants), and skin barrier defects.",
    careTips: "Moisturize frequently (emollients), avoid triggers, use mild soaps, take lukewarm baths, topical corticosteroids or calcineurin inhibitors, antihistamines for itching. See a doctor for diagnosis and management.",
  },
  {
    name: "Psoriasis",
    icon: <ShieldAlert className="h-6 w-6 text-primary" />,
    symptoms: "Raised, red patches covered with silvery-white scales (plaques). Can be itchy or sore. Commonly affects elbows, knees, scalp, and lower back.",
    causes: "Autoimmune condition where the immune system mistakenly attacks healthy skin cells, causing rapid cell turnover. Genetics and environmental triggers play a role.",
    careTips: "Topical treatments (corticosteroids, vitamin D analogs), phototherapy (light therapy), systemic medications (methotrexate, cyclosporine, biologics). Requires dermatologist management.",
  },
  {
    name: "Vitiligo",
    icon: <Droplet className="h-6 w-6 text-primary" />, // Example icon
    symptoms: "Loss of skin color (melanin) resulting in smooth, white patches. Can affect any part of the body, including hair and inside the mouth.",
    causes: "Autoimmune condition where the body attacks melanocytes (pigment-producing cells). Genetic predisposition and triggers like stress or sunburn may be involved.",
    careTips: "Sun protection is crucial for affected areas. Treatments aim to restore color (topical corticosteroids, calcineurin inhibitors, phototherapy, JAK inhibitors) or camouflage. Consult a dermatologist.",
  },
  {
    name: "Melanoma",
    icon: <AlertCircle className="h-6 w-6 text-destructive" />,
    symptoms: "Often appears as a new mole or a change in an existing mole. Use the ABCDE rule: Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolving (changing).",
    causes: "Develops from melanocytes, often due to UV radiation damage from sun exposure or tanning beds. Genetics increase risk.",
    careTips: "IMMEDIATE dermatological consultation is essential. Early detection is key. Treatment involves surgical removal; further therapy (immunotherapy, targeted therapy) depends on stage. Regular skin checks and sun protection are vital for prevention.",
  },
  {
    name: "Rosacea",
    icon: <HeartPulse className="h-6 w-6 text-primary" />,
    symptoms: "Facial redness/flushing, visible blood vessels, bumps (papules/pustules), eye irritation (ocular rosacea), thickened skin (rhinophyma - rare).",
    causes: "Unknown, likely involves genetic, environmental, inflammatory, and vascular factors. Triggers include sun, heat, spicy food, alcohol.",
    careTips: "Avoid triggers, use gentle skincare, sun protection, topical medications (metronidazole, azelaic acid), oral antibiotics, laser therapy. Requires dermatologist management.",
  },
   {
    name: "Seborrheic Dermatitis",
    icon: <Activity className="h-6 w-6 text-primary" />, // Reuse icon or find a better one
    symptoms: "Red skin with flaky, yellowish scales. Affects oily areas like the scalp (dandruff), face (eyebrows, sides of nose), chest, and back. Can be itchy.",
    causes: "Likely related to a yeast (Malassezia) on the skin and an inflammatory response. Not related to poor hygiene.",
    careTips: "Medicated shampoos (ketoconazole, selenium sulfide, zinc pyrithione), topical antifungal creams, mild corticosteroids. Manage stress. Consult a doctor if persistent.",
  },
  {
    name: "Hives (Urticaria)",
     icon: <Info className="h-6 w-6 text-primary" />,
    symptoms: "Raised, itchy welts (wheals) on the skin. Can appear anywhere, vary in size, and may come and go quickly.",
    causes: "Allergic reactions (food, medication, insect stings), infections, stress, physical stimuli (pressure, cold). Often the cause is unknown (idiopathic).",
    careTips: "Antihistamines are the primary treatment. Avoid known triggers. Cool compresses may help itching. See a doctor for severe, persistent, or concerning cases (e.g., with breathing difficulty).",
  },
  {
    name: "Contact Dermatitis",
     icon: <ShieldAlert className="h-6 w-6 text-primary" />,
    symptoms: "Red, itchy rash caused by direct contact with a substance. Can be irritant (damage to skin) or allergic (immune response). May blister or ooze.",
    causes: "Irritants (soaps, detergents, chemicals) or allergens (poison ivy, nickel, fragrances, preservatives).",
    careTips: "Identify and avoid the causative substance. Wash affected skin. Topical corticosteroids, cool compresses, antihistamines for itching. Patch testing by a dermatologist can identify allergens.",
  },
  {
    name: "Actinic Keratosis (AK)",
     icon: <AlertCircle className="h-6 w-6 text-amber-600" />, // Use a warning color
    symptoms: "Rough, scaly patches on sun-exposed skin (face, scalp, ears, hands). Can be skin-colored, reddish-brown, or yellowish. May be slightly raised.",
    causes: "Prolonged UV exposure from sun or tanning beds. More common in fair-skinned individuals and older adults.",
    careTips: "Considered precancerous (can develop into squamous cell carcinoma). Requires dermatologist evaluation and treatment (cryotherapy, topical creams, photodynamic therapy). Sun protection is crucial for prevention.",
  },
];

export default function AwarenessPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground">
        {/* Simple Header for this page */}
        <nav className="w-full py-3 bg-card shadow-sm sticky top-0 z-50 border-b">
            <div className="container mx-auto flex items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-primary hover:opacity-90 transition-opacity">
                    <HeartPulse className="h-6 w-6" />
                    <span>SkinDeep AI</span>
                </Link>
                <div className="flex space-x-2 items-center">
                    <Button variant="ghost" asChild>
                        <Link href="/" className="text-sm">Home</Link>
                    </Button>
                     <span className="text-muted-foreground/30">|</span>
                    <Button variant="ghost" disabled className="text-sm font-semibold">Skin Conditions</Button>
                     {/* Add other nav links if needed */}
                </div>
            </div>
        </nav>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3">Learn About Common Skin Conditions</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Understanding symptoms and potential causes is the first step towards better skin health.
                This information is for educational purposes only.
            </p>
              <Alert variant="default" className="mt-6 max-w-2xl mx-auto text-left bg-blue-50 border-blue-200 text-blue-800 [&>svg]:text-blue-600">
                <Info className="h-4 w-4"/>
                <AlertTitle className="font-semibold">Always Consult a Professional</AlertTitle>
                <AlertDescription>
                   The details provided here are general information. For any skin concerns, diagnosis, or treatment, please consult a qualified dermatologist or healthcare provider.
                </AlertDescription>
             </Alert>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skinConditionsInfo.map((condition) => (
            <Card key={condition.name} className="flex flex-col h-full">
              <CardHeader className="flex flex-row items-center space-x-3 pb-3">
                {condition.icon}
                <CardTitle className="text-xl">{condition.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow space-y-3">
                <div>
                  <h3 className="font-semibold text-sm mb-1 text-primary">Common Symptoms:</h3>
                  <p className="text-sm text-foreground/90">{condition.symptoms}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1 text-primary">Potential Causes:</h3>
                  <p className="text-sm text-foreground/90">{condition.causes}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1 text-primary">General Care Tips:</h3>
                  <p className="text-sm text-foreground/90">{condition.careTips}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

        {/* Footer Section */}
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
