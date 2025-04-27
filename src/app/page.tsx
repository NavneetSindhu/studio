
"use client";

import { useState, useRef } from "react";
import { classifyImage, ClassifyImageOutput } from "@/ai/flows/classify-image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Image as ImageIcon, AlertCircle, Upload, ListChecks, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { QuestionnaireModal } from "@/components/QuestionnaireModal"; // Import the modal

// Updated Skin Conditions with simpler descriptions and icons
const skinConditions = [
    { name: "Acne", description: "Pimples, blackheads, oily skin.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><circle cx="12" cy="8" r="1"/><circle cx="10" cy="13" r="1"/><circle cx="14" cy="13" r="1"/><circle cx="12" cy="17" r="1"/><path d="M12 2a10 10 0 1 0 10 10 A10 10 0 0 0 12 2z"/></svg> },
    { name: "Eczema", description: "Itchy, red, inflamed skin patches.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 2c-3 0-5 2-8 2s-5-2-8-2c-3 0-5 2-5 5s2 5 5 5c0 3-2 5-2 8s2 5 5 5 5-2 8-2 5 2 8 2 5-2 5-5-2-5-2-8 2-5 5-5-2-5-5-5c-3 0-5 2-8 2s-5-2-8-2z"/><path d="M14 14a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"/><path d="M10 10c.5-1 2-2 4-2"/><path d="M14 10c-.5 1-2 2-4 2"/></svg> },
    { name: "Psoriasis", description: "Red, scaly patches, often on joints.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 14c-4.5 0-8-3.5-8-8s3.5-8 8-8 8 3.5 8 8-3.5 8-8 8z"/><path d="M12 14c2 0 4-2 4-4s-2-4-4-4-4 2-4 4 2 4 4 4z"/><path d="M12 22c4.5 0 8-3.5 8-8s-3.5-8-8-8-8 3.5-8 8 3.5 8 8 8z"/></svg> },
    { name: "Vitiligo", description: "Loss of skin color in patches.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 12a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" fill="currentColor" fillOpacity="0.3"/><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg> },
    { name: "Melanoma", description: "Serious skin cancer; unusual moles.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-destructive"><path d="m12 2-10 18h20L12 2z"/><line x1="12" x2="12" y1="8" y2="14"/><line x1="12" x2="12.01" y1="18"/></svg> },
];


function ImageUpload({ onImageUpload, loading }: { onImageUpload: (image: string) => void; loading: boolean }) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      setPreview(null);
      setError(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError("Invalid File! Please upload a valid face image (.jpg, .jpeg, .png).");
      setSelectedImage(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
        setError("File is too large! Maximum size is 5MB.");
        setSelectedImage(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        return;
    }

    setSelectedImage(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = () => {
    if (preview && !loading) {
      onImageUpload(preview);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Your Image</CardTitle>
        <CardDescription>Upload a clear face image for analysis.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div
          className="relative w-full overflow-hidden rounded-md border aspect-video flex flex-col items-center justify-center bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={triggerFileInput}
          role="button"
          aria-label="Upload image"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && triggerFileInput()}
        >
          {preview ? (
            <img src={preview} alt="Uploaded Face Preview" className="object-contain h-full w-full" />
          ) : (
             <div className="text-center p-4">
               <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
               <p className="text-sm text-muted-foreground">Click or tap here to upload</p>
               <p className="text-xs text-muted-foreground mt-1">.jpg, .jpeg, .png (Max 5MB)</p>
             </div>
          )}
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleImageChange}
          className="hidden"
          aria-hidden="true"
        />
        <Button onClick={handleUpload} disabled={!preview || loading} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
           {loading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
            </>
            ) : 'Analyze Image'}
        </Button>
      </CardContent>
    </Card>
  );
}

function ResultDisplay({ result, loading, apiError }: { result: ClassifyImageOutput | null, loading: boolean, apiError: string | null }) {
    if (loading) {
      return (
        <Card className="mt-6 animate-pulse">
          <CardHeader>
            <CardTitle>Analyzing Image...</CardTitle>
            <CardDescription>Please wait while the AI processes your image.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
            <div className="h-2 bg-muted rounded w-full"></div>
            <p className="text-sm text-muted-foreground">This may take a moment...</p>
          </CardContent>
        </Card>
      );
    }

    if (apiError) {
        return (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Analysis Failed</AlertTitle>
            <AlertDescription>
              {apiError} Please try a different image or check your connection.
              If the problem persists, contact support.
            </AlertDescription>
          </Alert>
        );
      }

    if (!result && !loading && !apiError) {
        return (
           <Card className="mt-6 border-dashed border-muted-foreground/50">
              <CardHeader>
                <CardTitle>Analysis Result</CardTitle>
                <CardDescription>Upload an image to see the analysis results here.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-24">
                 <p className="text-sm text-muted-foreground italic">No analysis performed yet.</p>
              </CardContent>
           </Card>
        );
    }

  // Find the condition details based on the predicted disease name
  const conditionDetails = skinConditions.find(c => c.name.toLowerCase() === result?.predictedDisease?.toLowerCase());

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Analysis Result</CardTitle>
        <CardDescription>Potential findings based on the image analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-4 bg-secondary/50 rounded-md border">
               {conditionDetails?.icon ? React.cloneElement(conditionDetails.icon, { className: "h-10 w-10 text-primary mt-1 flex-shrink-0" }) : <HeartPulse className="h-10 w-10 text-primary mt-1 flex-shrink-0" />}
              <div>
                <h3 className="text-lg font-semibold">Predicted Condition: {result.predictedDisease}</h3>
                <p className="text-sm text-muted-foreground">
                    {conditionDetails?.description || "Based on HAM10000 dataset categories."}
                </p>
              </div>
            </div>
             <div>
               <p className="text-sm font-medium mb-1">Confidence Score:</p>
               <div className="flex items-center space-x-2">
                 <Progress value={result.confidencePercentage} className="flex-1 h-2.5 rounded-full"/>
                 <span className="text-sm font-semibold">{result.confidencePercentage.toFixed(1)}%</span>
               </div>
                <p className="text-xs text-muted-foreground mt-1">Indicates the AI's confidence in the prediction.</p>
             </div>
             <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800 [&>svg]:text-amber-600">
                <AlertCircle className="h-4 w-4"/>
                <AlertTitle className="font-semibold">Important Disclaimer</AlertTitle>
                <AlertDescription>
                    This AI analysis is for informational purposes only and is **not** a medical diagnosis. Always consult a qualified dermatologist or healthcare professional for accurate diagnosis and treatment.
                </AlertDescription>
             </Alert>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Analysis complete, but no result data available. Please try again.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [result, setResult] = useState<ClassifyImageOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const uploadSectionRef = useRef<HTMLElement>(null);

  const handleImageUpload = async (image: string) => {
    console.log("Starting image classification...");
    setLoading(true);
    setApiError(null);
    setResult(null);
    try {
      console.log("Calling classifyImage API...");
      const apiResult = await classifyImage({ imageUri: image });
      console.log("API Response:", apiResult);
      if (apiResult && apiResult.predictedDisease && typeof apiResult.confidencePercentage === 'number') {
        setResult(apiResult);
        console.log("Classification successful:", apiResult);
      } else {
          console.error("Invalid API response structure:", apiResult);
          setApiError("Received an unexpected result from the analysis service.");
          setResult(null);
      }
    } catch (error: any) {
      console.error("Error during image classification API call:", error);
      let errorMessage = "Failed to classify the image due to an unexpected error.";
      if (error instanceof Error) {
           errorMessage = `Failed to classify the image: ${error.message}`;
      } else if (typeof error === 'string') {
          errorMessage = error;
      } else if (error && typeof error.message === 'string') {
          errorMessage = `Failed to classify the image: ${error.message}`;
      }
      setApiError(errorMessage);
      setResult(null);
    } finally {
      console.log("Finished image classification attempt.");
      setLoading(false);
    }
  };

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground">
      {/* Enhanced Top Navigation Bar */}
      <nav className="w-full py-3 bg-card shadow-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto flex items-center justify-between px-4">
           {/* Logo Placeholder - Replace with actual Logo component or image */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-primary hover:opacity-90 transition-opacity">
             <HeartPulse className="h-6 w-6" />
             <span>SkinDeep AI</span>
          </Link>
          <div className="hidden md:flex space-x-2 items-center">
            <Button variant="ghost" asChild>
               <Link href="/" className="text-sm">Home</Link>
            </Button>
            <span className="text-muted-foreground/30">|</span>
            <Button variant="ghost" asChild>
               <Link href="/awareness" className="text-sm">Skin Conditions</Link>
            </Button>
            <span className="text-muted-foreground/30">|</span>
             {/* Keep the Upload Image button if needed, or rely on hero buttons */}
            <Button variant="ghost" onClick={scrollToUpload} className="text-sm">
               Upload Image
            </Button>
             {/* Add About and Contact later */}
             {/* <span className="text-muted-foreground/30">|</span> */}
             {/* <Button variant="ghost" asChild><Link href="/about" className="text-sm">About</Link></Button> */}
             {/* <span className="text-muted-foreground/30">|</span> */}
             {/* <Button variant="ghost" asChild><Link href="/contact" className="text-sm">Contact</Link></Button> */}
          </div>
           {/* Mobile Menu Trigger */}
          <div className="md:hidden">
             <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
             </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
       <section className="relative w-full h-[60vh] md:h-[75vh] flex items-center justify-center text-center bg-gradient-to-br from-primary/70 via-primary/50 to-secondary/60 text-white px-4">
         {/* Optional subtle background pattern */}
         <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
         <div className="relative z-10 max-w-4xl mx-auto">
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground drop-shadow-lg">Understand Your Skin Better with AI</h1>
           <p className="text-lg md:text-xl lg:text-2xl mb-8 text-primary-foreground/90 drop-shadow-md max-w-2xl mx-auto">Get a preliminary analysis of potential skin conditions by answering a few questions or uploading an image.</p>
           <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <QuestionnaireModal>
                 <Button size="lg" variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-3 text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                    <ListChecks className="mr-2 h-5 w-5"/>
                    Assess Your Skin
                 </Button>
              </QuestionnaireModal>
             <Button size="lg" variant="outline" onClick={scrollToUpload} className="bg-white/20 text-white border-white/50 hover:bg-white/30 hover:border-white/70 rounded-full px-8 py-3 text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                <Upload className="mr-2 h-5 w-5"/>
                Upload Image
             </Button>
           </div>
         </div>
       </section>

      {/* Categories Section */}
      <section id="conditions" className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-semibold text-center mb-4">Common Skin Conditions We Analyze</h2>
         <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Our AI is trained to identify patterns associated with these common conditions based on the HAM10000 dataset. <Link href="/awareness" className="text-primary hover:underline">Learn more</Link>.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {skinConditions.map((condition) => (
            <Card key={condition.name} className="text-center hover:shadow-lg transition-shadow duration-300 border border-border rounded-lg overflow-hidden bg-card flex flex-col items-center justify-start pt-6 pb-4 px-4 h-full">
               <div className="mb-3 flex-shrink-0">{condition.icon}</div>
               <CardTitle className="text-lg mb-1 font-medium">{condition.name}</CardTitle>
               <CardDescription className="text-sm leading-relaxed flex-grow">{condition.description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" ref={uploadSectionRef} className="container mx-auto py-16 px-4 bg-gradient-to-b from-background to-secondary/30 rounded-lg my-8">
        <div className="max-w-2xl mx-auto">
          <ImageUpload onImageUpload={handleImageUpload} loading={loading}/>
           <ResultDisplay result={result} loading={loading} apiError={apiError} />
        </div>
      </section>

      {/* Educational Section */}
      <section className="w-full bg-secondary py-16">
         <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl font-semibold mb-4">Why Use SkinDeep AI?</h2>
             <p className="text-muted-foreground max-w-3xl mx-auto mb-10">Early awareness and timely consultation are key to managing skin health. Our tool aims to provide accessible preliminary insights.</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="bg-card shadow-md text-left">
                 <CardHeader>
                     <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-primary"/> Early Awareness</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-card-foreground text-sm">Identifying potential issues early can prompt timely visits to a healthcare professional, leading to better outcomes.</p>
                 </CardContent>
               </Card>
               <Card className="bg-card shadow-md text-left">
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-primary"/> AI Assistance</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <p className="text-card-foreground text-sm">AI analyzes image patterns, potentially assisting in recognizing conditions and encouraging further medical review.</p>
                 </CardContent>
               </Card>
                <Card className="bg-card shadow-md text-left">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2"><ListChecks className="h-5 w-5 text-primary"/> Informational Tool</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-card-foreground text-sm">Use our tool to gain initial insights, but remember it's not a substitute for a professional medical diagnosis.</p>
                  </CardContent>
                </Card>
             </div>
         </div>
       </section>

      {/* Footer Section */}
      <footer className="w-full py-8 bg-card text-muted-foreground border-t mt-16">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 text-center md:text-left">
          <div className="text-xs mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} SkinDeep AI. All Rights Reserved. <br/>
            <span className="text-destructive font-semibold">Disclaimer: This tool is for informational purposes only and does not provide medical advice.</span>
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
