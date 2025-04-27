
"use client";

import { useState, useRef } from "react";
import { classifyImage, ClassifyImageOutput } from "@/ai/flows/classify-image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Image as ImageIcon, AlertCircle, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const skinConditions = [
  { name: "Acne", description: "Common condition causing pimples, blackheads, and oily skin.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
  { name: "Eczema", description: "Causes itchy, red, and inflamed skin patches.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 2c-3 0-5 2-8 2s-5-2-8-2c-3 0-5 2-5 5s2 5 5 5c0 3-2 5-2 8s2 5 5 5 5-2 8-2 5 2 8 2 5-2 5-5-2-5-2-8 2-5 5-5-2-5-5-5c-3 0-5 2-8 2s-5-2-8-2z"/><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/></svg> },
  { name: "Psoriasis", description: "Leads to red, scaly patches, often on elbows and knees.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg> },
  { name: "Vitiligo", description: "Causes loss of skin color, resulting in white patches.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M12 22c-2.67 0-8-1.33-8-4v-4h16v4c0 2.67-5.33 4-8 4z"/></svg> },
  { name: "Melanoma", description: "A serious form of skin cancer; look for unusual moles.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-destructive"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
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
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Size check (optional, e.g., max 5MB)
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
        <CardTitle>Try it Now: Upload Your Face Image</CardTitle>
        <CardDescription>Please upload a clear image of the face for analysis.</CardDescription>
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
          className="relative w-full overflow-hidden rounded-md border aspect-square flex flex-col items-center justify-center bg-muted/20 cursor-pointer hover:bg-muted/40 transition-colors"
          onClick={triggerFileInput}
        >
          {preview ? (
            <img src={preview} alt="Uploaded Face" className="object-contain h-full w-full" />
          ) : (
             <div className="text-center p-4">
               <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
               <p className="text-sm text-muted-foreground">Click or tap here to upload an image</p>
               <p className="text-xs text-muted-foreground mt-1">.jpg, .jpeg, .png accepted (Max 5MB)</p>
             </div>
          )}
        </div>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleImageChange}
          className="hidden" // Hide the default input, use the div above
        />
        <Button onClick={handleUpload} disabled={!preview || loading} className="bg-primary text-primary-foreground w-full">
          {loading ? 'Analyzing...' : 'Analyze Image'}
        </Button>
      </CardContent>
    </Card>
  );
}

function ResultDisplay({ result, loading, apiError }: { result: ClassifyImageOutput | null, loading: boolean, apiError: string | null }) {
    if (loading) {
      return (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Analyzing Image...</CardTitle>
            <CardDescription>Please wait while the AI processes your image.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
            <Progress value={undefined} className="w-full h-2" /> {/* Indeterminate */}
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
              {apiError} Please check your connection or try a different image.
              If the problem persists, contact support.
            </AlertDescription>
          </Alert>
        );
      }


    if (!result && !loading && !apiError) {
        // Initial state or after clearing
        return (
           <Card className="mt-6">
              <CardHeader>
                <CardTitle>Analysis Result</CardTitle>
                <CardDescription>Upload an image to see the analysis results here.</CardDescription>
              </CardHeader>
              <CardContent>
                 <p className="text-sm text-muted-foreground">No analysis performed yet.</p>
              </CardContent>
           </Card>
        );
    }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Analysis Result</CardTitle>
        <CardDescription>Here are the potential findings based on the image analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500 h-6 w-6" />
              <div>
                <h3 className="text-lg font-semibold">Predicted Condition: {result.predictedDisease}</h3>
                <p className="text-sm text-muted-foreground">Based on HAM10000 dataset categories.</p>
              </div>
            </div>
             <div>
               <p className="text-sm font-medium mb-1">Confidence:</p>
               <div className="flex items-center space-x-2">
                 <Progress value={result.confidencePercentage} className="flex-1 h-2.5"/>
                 <span className="text-sm font-semibold">{result.confidencePercentage.toFixed(1)}%</span>
               </div>
             </div>
             <Alert>
                <AlertCircle className="h-4 w-4"/>
                <AlertTitle>Disclaimer</AlertTitle>
                <AlertDescription>
                    This AI analysis is for informational purposes only and is not a substitute for professional medical advice. Consult a dermatologist for an accurate diagnosis.
                </AlertDescription>
             </Alert>
          </div>
        ) : (
          // This case should ideally be handled by the initial state block above
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
  const uploadSectionRef = useRef<HTMLElement>(null); // Ref for the upload section


  const handleImageUpload = async (image: string) => {
    console.log("Starting image classification..."); // Client-side log
    setLoading(true);
    setApiError(null);
    setResult(null); // Clear previous results
    try {
      console.log("Calling classifyImage API...");
      const apiResult = await classifyImage({ imageUri: image });
      console.log("API Response:", apiResult); // Log the raw response
      if (apiResult && apiResult.predictedDisease && typeof apiResult.confidencePercentage === 'number') {
        setResult(apiResult);
        console.log("Classification successful:", apiResult);
      } else {
          console.error("Invalid API response structure:", apiResult);
          setApiError("Received an unexpected result from the analysis service.");
          setResult(null);
      }
    } catch (error: any) {
      console.error("Error during image classification API call:", error); // Log the full error
      // Try to get a more specific error message
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
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <nav className="w-full py-4 bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4">
          <Link href="/" className="text-2xl font-bold text-primary">Face Disease AI</Link>
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="#conditions" scroll={false} className="hover:text-primary transition-colors">Skin Conditions</Link>
            <Button variant="ghost" onClick={scrollToUpload} className="hover:text-primary transition-colors px-3 py-2 h-auto">Upload Image</Button>
            {/* Add About and Contact pages/links later if needed */}
            {/* <Link href="/about" className="hover:text-primary transition-colors">About</Link> */}
            {/* <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link> */}
          </div>
           {/* Basic Mobile Menu Trigger (functionality not implemented yet) */}
          <div className="md:hidden">
             <Button variant="ghost" size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
             </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-[50vh] md:h-[70vh] flex items-center justify-center bg-cover bg-center text-white" style={{ backgroundImage: `url('https://picsum.photos/1600/900?grayscale&blur=2')` }}>
        <div className="absolute inset-0 bg-black/50"></div> {/* Darker overlay */}
        <div className="container mx-auto text-center relative z-10 px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">Detect Skin Diseases Early with AI</h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 drop-shadow-md">Upload your face image and get instant analysis based on common skin conditions.</p>
          <Button onClick={scrollToUpload} size="lg" className="bg-primary text-primary-foreground rounded-full px-8 py-3 text-lg shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-105">
            <span>Upload Now</span> <span className="ml-2">➔</span>
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section id="conditions" className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-semibold text-center mb-12">Common Skin Conditions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {skinConditions.map((condition) => (
            <Card key={condition.name} className="text-center hover:shadow-lg transition-shadow duration-300 border border-border rounded-lg overflow-hidden">
               <CardContent className="p-6 flex flex-col items-center justify-center">
                 <div className="mb-4">{condition.icon}</div>
                 <CardTitle className="text-xl mb-2">{condition.name}</CardTitle>
                 <CardDescription className="text-sm">{condition.description}</CardDescription>
                 {/* Removed Learn More link for simplicity, focusing on upload */}
               </CardContent>
            </Card>
          ))}
        </div>
         <Alert className="mt-12">
             <AlertCircle className="h-4 w-4"/>
             <AlertTitle>Important Note</AlertTitle>
             <AlertDescription>
                 Our AI is trained on the HAM10000 dataset, which includes categories like Melanocytic nevi, Melanoma, Benign keratosis-like lesions, etc. The analysis will predict one of these categories.
             </AlertDescription>
         </Alert>
      </section>

      {/* Upload Section */}
      <section id="upload" ref={uploadSectionRef} className="container mx-auto py-16 px-4 bg-muted/30 rounded-lg my-8">
        <div className="max-w-2xl mx-auto">
          <ImageUpload onImageUpload={handleImageUpload} loading={loading}/>
           <ResultDisplay result={result} loading={loading} apiError={apiError} />
        </div>
      </section>

      {/* Educational Section */}
      <section className="w-full bg-secondary py-16">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          <Card className="bg-card shadow-md">
            <CardHeader>
                <CardTitle>Why Early Detection Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-card-foreground">Identifying potential skin issues early can lead to more effective treatment and better health outcomes. Our AI aims to provide a preliminary analysis to encourage timely consultation.</p>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-md">
             <CardHeader>
                <CardTitle>How AI Assists Dermatology</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-card-foreground">AI algorithms can analyze images for patterns associated with various skin conditions, potentially assisting dermatologists and increasing access to initial assessments.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full py-8 bg-gray-100 text-muted-foreground border-t mt-16">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4">
          <div className="text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Face Disease AI. All Rights Reserved. <span className="text-red-600 font-semibold">Disclaimer: Not a medical diagnosis.</span>
          </div>
          <div className="flex space-x-4">
            {/* Replace # with actual links when available */}
            <Link href="#" className="hover:text-primary text-sm">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary text-sm">Terms of Service</Link>
            <Link href="mailto:support@facediseaseai.example.com" className="hover:text-primary text-sm">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

    