"use client";

import { useState } from "react";
import { classifyImage, ClassifyImageOutput } from "@/ai/flows/classify-image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const skinConditions = [
  { name: "Acne", icon: "" },
  { name: "Eczema", icon: "" },
  { name: "Psoriasis", icon: "" },
  { name: "Vitiligo", icon: "" },
  { name: "Melanoma", icon: "" },
];

function ImageUpload({ onImageUpload }: { onImageUpload: (image: string) => void }) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    if (preview) {
      onImageUpload(preview);
    }
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
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {preview ? (
          <div className="relative w-full overflow-hidden rounded-md border aspect-square">
            <img src={preview} alt="Uploaded Face" className="object-cover" />
          </div>
        ) : (
          <div className="relative w-full overflow-hidden rounded-md border aspect-square flex flex-col items-center justify-center">
             <Image className="h-6 w-6 text-muted-foreground" />
             <p className="text-sm text-muted-foreground">No image uploaded</p>
          </div>
        )}
        <Input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleImageChange} />
        <Button onClick={handleUpload} disabled={!preview} className="bg-primary text-primary-foreground">
          Analyze Image
        </Button>
      </CardContent>
    </Card>
  );
}

function ResultDisplay({ result }: { result: ClassifyImageOutput | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Result</CardTitle>
        <CardDescription>Here are the results of the image analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-500 h-5 w-5" />
              <h3 className="text-lg font-semibold">Predicted Disease: {result.predictedDisease}</h3>
            </div>
            <p>Confidence: {result.confidencePercentage.toFixed(2)}%</p>
            <Progress value={result.confidencePercentage} />
          </div>
        ) : (
          <p>No analysis has been performed yet. Please upload an image to see the results.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [result, setResult] = useState<ClassifyImageOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleImageUpload = async (image: string) => {
    setLoading(true);
    setApiError(null);
    try {
      const apiResult = await classifyImage({ imageUri: image });
      setResult(apiResult);
    } catch (error: any) {
      console.error("Error classifying image:", error);
      setApiError("Failed to classify the image. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground">
      {/* Top Navigation Bar */}
      <nav className="w-full py-4 bg-white shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <a className="text-2xl font-bold" href="/">Face Disease AI</a>
          <div className="flex space-x-6">
            <a href="/" className="hover:text-primary">Home</a>
            <a href="/skin-conditions" className="hover:text-primary">Skin Conditions</a>
            <a href="#upload" className="hover:text-primary">Upload Image</a>
            <a href="/about" className="hover:text-primary">About</a>
            <a href="/contact" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-96 flex items-center justify-center bg-[url('https://picsum.photos/1920/1080')] bg-cover bg-center text-white">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl font-bold mb-4">Detect Skin Diseases Early with AI</h1>
          <p className="text-xl mb-8">Upload your face image and get instant disease analysis from our AI system.</p>
          <Button className="bg-primary text-primary-foreground rounded-full px-8 py-3 text-lg">
            <span>Upload Now</span> <span>➔</span>
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto py-16">
        <h2 className="text-3xl font-semibold text-center mb-8">Skin Conditions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {skinConditions.map((condition) => (
            <Card key={condition.name} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="flex flex-col items-center justify-center p-4">
                {condition.icon && <div className="mb-2">{condition.icon}</div>}
                <a href="#upload" className="text-lg font-medium hover:text-primary">{condition.name}</a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Upload Section */}
      <section id="upload" className="container mx-auto py-16">
        <div className="max-w-2xl mx-auto">
          <ImageUpload onImageUpload={handleImageUpload} />
          {loading ? (
             <Card>
               <CardHeader>
                 <CardTitle>Analyzing Image...</CardTitle>
                 <CardDescription>Please wait while the image is being analyzed.</CardDescription>
               </CardHeader>
               <CardContent className="flex flex-col items-center justify-center space-y-4">
                 <Progress value={0} />
               </CardContent>
             </Card>
           ) : (
            <>
              {apiError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
              <ResultDisplay result={result} />
            </>
          )}
        </div>
      </section>

      {/* Educational Section */}
      <section className="bg-muted py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-white shadow-md">
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">Why early detection matters?</h3>
              <p>Early detection of skin diseases can significantly improve treatment outcomes and overall health.</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-md">
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">How AI helps dermatology?</h3>
              <p>AI provides faster, more accurate analysis, making dermatology accessible to more people.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full py-8 bg-secondary text-muted-foreground">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm">
            &copy; 2025 Face Disease AI. All Rights Reserved.
          </div>
          <div className="flex space-x-4">
            <a href="/about" className="hover:text-primary">About Us</a>
            <a href="/privacy" className="hover:text-primary">Privacy Policy</a>
            <a href="/terms" className="hover:text-primary">Terms &amp; Conditions</a>
            <a href="mailto:contact@example.com" className="hover:text-primary">Contact Email</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
