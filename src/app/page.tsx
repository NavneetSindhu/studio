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
        <CardTitle>Upload Face Image</CardTitle>
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
        <Button onClick={handleUpload} disabled={!preview}>
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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
        <h1 className="text-4xl font-bold text-primary">
          SkinDeep AI
        </h1>
        <p className="text-gray-600 mt-3">Detect facial skin diseases from uploaded images.</p>
        <div className="mt-8 w-full max-w-2xl space-y-6">
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
      </main>
    </div>
  );
}
