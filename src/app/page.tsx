
"use client";

import React, { useState, useRef, useEffect } from "react";
import { classifyImage, ClassifyImageOutput, QuestionnaireData } from "@/ai/flows/classify-image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle, Upload, ListChecks, HeartPulse, MapPin, Languages, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { QuestionnaireModal } from "@/components/QuestionnaireModal";
import { ThemeToggle } from "@/components/ThemeToggle"; // Import ThemeToggle
import { LanguageToggle } from "@/components/LanguageToggle"; // Import LanguageToggle
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ClinicResultsModal, ClinicInfo } from "@/components/ClinicResultsModal"; // Import ClinicResultsModal

// Placeholder skin conditions data (replace with actual data structure if needed)
const skinConditions = [
    { name: "Acne", description: "Pimples, blackheads, oily skin.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><circle cx="12" cy="8" r="1"/><circle cx="10" cy="13" r="1"/><circle cx="14" cy="13" r="1"/><circle cx="12" cy="17" r="1"/><path d="M12 2a10 10 0 1 0 10 10 A10 10 0 0 0 12 2z"/></svg> },
    { name: "Eczema", description: "Itchy, red, inflamed skin patches.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 2c-3 0-5 2-8 2s-5-2-8-2c-3 0-5 2-5 5s2 5 5 5c0 3-2 5-2 8s2 5 5 5 5-2 8-2 5 2 8 2 5-2 5-5-2-5-2-8 2-5 5-5-2-5-5-5c-3 0-5 2-8 2s-5-2-8-2z"/><path d="M14 14a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"/><path d="M10 10c.5-1 2-2 4-2"/><path d="M14 10c-.5 1-2 2-4 2"/></svg> },
    { name: "Psoriasis", description: "Red, scaly patches, often on joints.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 14c-4.5 0-8-3.5-8-8s3.5-8 8-8 8 3.5 8 8-3.5 8-8 8z"/><path d="M12 14c2 0 4-2 4-4s-2-4-4-4-4 2-4 4 2 4 4 4z"/><path d="M12 22c4.5 0 8-3.5 8-8s-3.5-8-8-8-8 3.5-8 8 3.5 8 8 8z"/></svg> },
    { name: "Vitiligo", description: "Loss of skin color in patches.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 12a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" fill="currentColor" fillOpacity="0.3"/><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg> },
    { name: "Melanoma", description: "Serious skin cancer; unusual moles.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-destructive"><path d="m12 2-10 18h20L12 2z"/><line x1="12" x2="12" y1="8" y2="14"/><line x1="12" x2="12.01" y1="18"/></svg> },
];

// --- Image Upload Component ---
function ImageUpload({ onImageUpload, loading, currentImagePreview }: { onImageUpload: (file: File | null) => void; loading: boolean; currentImagePreview: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setError(null);
      onImageUpload(null); // Clear image if deselected
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError("Invalid File! Please upload a valid face image (.jpg, .jpeg, .png).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onImageUpload(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File is too large! Maximum size is 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onImageUpload(null);
      return;
    }

    setError(null);
    onImageUpload(file); // Pass the File object up
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
          {currentImagePreview ? (
            <img src={currentImagePreview} alt="Uploaded Face Preview" className="object-contain h-full w-full" />
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
        {/* Analyze button moved outside this component */}
      </CardContent>
    </Card>
  );
}

// --- Result Display Component ---
function ResultDisplay({ result, loading, apiError, onFindClinics }: { result: ClassifyImageOutput | null; loading: boolean; apiError: string | null; onFindClinics: () => void }) {
    if (loading) {
      return (
        <Card className="mt-6 animate-pulse">
          <CardHeader>
            <CardTitle>Analyzing...</CardTitle>
            <CardDescription>Please wait while the AI processes your information.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
             {/* Simple spinner or progress indicator */}
             <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
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
              {apiError} Please try again or use a different image/information.
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
                <CardDescription>Submit an image and/or assessment to see results.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-24">
                 <p className="text-sm text-muted-foreground italic">No analysis performed yet.</p>
              </CardContent>
           </Card>
        );
    }

  // Find the condition details based on the predicted disease name (case-insensitive check)
  const predictedLower = result?.predictedDisease?.toLowerCase() ?? '';
  const conditionDetails = skinConditions.find(c => c.name.toLowerCase() === predictedLower);


  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Analysis Result</CardTitle>
        <CardDescription>Potential findings based on the provided information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result ? (
          <>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-4 bg-secondary/50 rounded-md border">
                 {conditionDetails?.icon ? React.cloneElement(conditionDetails.icon, { className: "h-10 w-10 text-primary mt-1 flex-shrink-0" }) : <HeartPulse className="h-10 w-10 text-primary mt-1 flex-shrink-0" />}
                <div>
                  <h3 className="text-lg font-semibold">Predicted Condition: {result.predictedDisease}</h3>
                  <p className="text-sm text-muted-foreground">
                      {conditionDetails?.description || "Based on AI analysis."}
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
                {result.notes && (
                   <div className="text-sm border-l-4 border-primary pl-3 py-1 bg-primary/10">
                       <p className="font-medium text-primary">AI Notes:</p>
                       <p className="text-foreground/80">{result.notes}</p>
                   </div>
                )}
               <Alert variant="warning" >
                  <AlertCircle className="h-4 w-4"/>
                  <AlertTitle className="font-semibold">Important Disclaimer</AlertTitle>
                  <AlertDescription>
                      This AI analysis is for informational purposes only and is **not** a medical diagnosis. Always consult a qualified dermatologist or healthcare professional for accurate diagnosis and treatment.
                  </AlertDescription>
               </Alert>
            </div>
            <Button onClick={onFindClinics} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                 <MapPin className="mr-2 h-4 w-4" /> Find Nearest Clinic
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Analysis complete, but no result data available. Please try again.</p>
        )}
      </CardContent>
    </Card>
  );
}

// --- Chatbot Component ---
function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! How can I help you with your skin concerns today?", sender: "bot" }
    ]);
    const [newMessage, setNewMessage] = useState("");

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const handleSendMessage = () => {
        if (newMessage.trim() !== "") {
            const userMessage = { text: newMessage, sender: "user" as const };
            setMessages(prev => [...prev, userMessage]);

            // Basic bot response (replace with actual AI logic)
            setTimeout(() => {
                 const botResponse = { text: "Thanks for your question! This chatbot is currently under development for informational purposes. Please use the main analysis features or consult a doctor for medical advice.", sender: "bot" as const };
                 setMessages(prev => [...prev, botResponse]);
            }, 500);
            setNewMessage("");
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <Button size="icon" onClick={toggleChat} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
                   <Avatar className="h-12 w-12">
                      <AvatarImage src="https://www.shutterstock.com/image-vector/chat-bot-icon-virtual-smart-600nw-2478937553.jpg" alt="Chatbot Avatar" />
                      <AvatarFallback>AI</AvatarFallback>
                   </Avatar>
                </Button>
            ) : (
                <Card className="w-80 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
                         <div className="flex items-center space-x-2">
                            <Avatar className="h-10 w-10">
                               <AvatarImage src="https://www.shutterstock.com/image-vector/chat-bot-icon-virtual-smart-600nw-2478937553.jpg" alt="Chatbot Avatar" />
                               <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                             <CardTitle className="text-sm font-semibold">SkinSeva AI Assistant</CardTitle>
                         </div>
                        <Button size="icon" variant="ghost" onClick={toggleChat} className="h-6 w-6">
                            <XCircle className="h-10 w-10" />
                        </Button>
                    </CardHeader>
                    <CardContent className="h-64 overflow-y-auto p-3 space-y-2">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <span className={cn("inline-block p-2 rounded-lg text-xs max-w-[80%]",
                                    message.sender === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary text-secondary-foreground rounded-bl-none")}>
                                    {message.text}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                    <div className="p-2 flex space-x-2 border-t">
                        <Input
                            type="text"
                            placeholder="Ask a question..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                            className="h-8 text-xs"
                        />
                        <Button onClick={handleSendMessage} size="sm" className="h-8">Send</Button>
                    </div>
                </Card>
            )}
        </div>
    );
}

// --- Main Home Component ---
export default function Home() {
  const [result, setResult] = useState<ClassifyImageOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [clinicData, setClinicData] = useState<ClinicInfo[] | null>(null);
  const [clinicLoading, setClinicLoading] = useState(false);
  const [clinicError, setClinicError] = useState<string | null>(null);
  const [isClear, setIsClear] = useState<boolean | null>(null);
  const [hasHumanSkin, setHasHumanSkin] = useState<boolean | null>(null);


  const uploadSectionRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  // Handle file selection from ImageUpload component
  const handleFileSelect = (file: File | null) => {
      setSelectedFile(file);
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setImagePreview(reader.result as string);
          };
          reader.readAsDataURL(file);
           // Reset result when new image is selected
           setResult(null);
           setApiError(null);
      } else {
          setImagePreview(null);
      }
  };

  // Handle questionnaire submission
  const handleQuestionnaireSubmit = (data: QuestionnaireData) => {
    setQuestionnaireData(data);
    console.log("Questionnaire data received:", data);
    toast({
        title: "Assessment Saved",
        description: "Your assessment details have been recorded.",
    });
    // Reset result when questionnaire is updated
    setResult(null);
    setApiError(null);
  };

  // Handle the combined analysis logic
  const handleAnalysis = async () => {
    if (!selectedFile && !questionnaireData) {
         toast({
           variant: "destructive",
           title: "No Input Provided",
           description: "Please upload an image or complete the assessment before analyzing.",
         });
         return;
     }
    if (!selectedFile) {
         toast({
           variant: "destructive",
           title: "Image Required",
           description: "Image upload is required for reliable analysis.",
         });
         return;
     }


    console.log("Starting analysis...");
    setLoading(true);
    setApiError(null);
    setResult(null);

    try {
        // Convert image file to data URI
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = async () => {
            const imageUri = reader.result as string;
            console.log("Calling classifyImage API with:", { imageUri: 'URI_preview_omitted', questionnaireData });
            try {
                // Simulate image clarity and human skin checks
                const isClearImage = true; // Replace with actual image analysis
                const hasHumanSkinContent = true; // Replace with actual image analysis

                if (!isClearImage) {
                    setApiError("Image error. Upload clear human skin image.");
                    setLoading(false);
                    return;
                }

                const apiResult = await classifyImage({
                    imageUri: imageUri,
                    questionnaireData: questionnaireData || undefined, // Pass questionnaire data or undefined
                    isClear: isClearImage,
                    hasHumanSkin: hasHumanSkinContent,
                });
                console.log("API Response:", apiResult);

                 if (apiResult && apiResult.predictedDisease && typeof apiResult.confidencePercentage === 'number') {
                     setResult(apiResult);
                     console.log("Classification successful:", apiResult);
                     // Scroll to results smoothly
                      const resultElement = document.getElementById('result-section');
                      resultElement?.scrollIntoView({ behavior: "smooth", block: "center" });

                 } else {
                     console.error("Invalid API response structure:", apiResult);
                     setApiError("Received an unexpected result from the analysis service.");
                     setResult(null);
                 }

            } catch (innerError: any) {
                 console.error("Error during classifyImage API call:", innerError);
                 let errorMessage = "Failed to classify the image due to an unexpected error.";
                 if (innerError instanceof Error) {
                      // Try to provide a more user-friendly message for common errors
                      if (innerError.message.includes('deadline')) {
                          errorMessage = "Analysis timed out. The server might be busy. Please try again.";
                      } else if (innerError.message.includes('output')) {
                           errorMessage = "The AI failed to generate a valid analysis. Please check the image or try again.";
                      } else {
                          errorMessage = `Failed to classify the image: ${innerError.message}`;
                      }
                 }
                 setApiError(errorMessage);
                 setResult(null);
                 toast({
                    variant: "destructive",
                    title: "Analysis Error",
                    description: errorMessage,
                  });
            } finally {
                 setLoading(false);
                 console.log("Finished image classification attempt.");
            }
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            setApiError("Could not read the uploaded image file.");
            setLoading(false);
             toast({
                variant: "destructive",
                title: "File Read Error",
                description: "Could not read the uploaded image file.",
              });
        };

    } catch (error) {
      // Catch potential errors before file reading starts (less likely here)
      console.error("Error preparing analysis:", error);
      setApiError("An error occurred before starting the analysis.");
      setLoading(false);
       toast({
            variant: "destructive",
            title: "Setup Error",
            description: "An error occurred before starting the analysis.",
        });
    }
  };


   // --- Find Clinics Logic (Updated for Modal) ---
   const handleFindClinics = () => {
     setClinicLoading(true);
     setClinicError(null);
     setClinicData(null);
     setIsClinicModalOpen(true); // Open the modal immediately

     console.log("Requesting location permission...");
     if (navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         async (position) => {
           const { latitude, longitude } = position.coords;
           console.log(`Location obtained: Lat ${latitude}, Lon ${longitude}`);
           toast({
             title: "Location Found",
             description: "Searching for nearby clinics...",
           });

           // --- Placeholder API Call ---
           // Replace this with your actual API call to fetch clinic data
           try {
              // Simulate network delay
              await new Promise(resolve => setTimeout(resolve, 1500));

               // *** Replace with ACTUAL API call logic ***
               // const response = await fetch(`/api/find-clinics?lat=${latitude}&lon=${longitude}`);
               // if (!response.ok) {
               //   throw new Error('Failed to fetch clinic data');
               // }
               // const fetchedClinics: ClinicInfo[] = await response.json();

              // --- START Placeholder Data ---
               const fetchedClinics: ClinicInfo[] = [
                   { id: '1', name: 'District General Hospital - Dermatology Dept.', address: '123 Govt. Hospital Road, City', distance: '1.5 km', estimatedCost: 'Free under PMJAY/State Scheme', schemes: ['PMJAY', 'State Scheme'], isGovernment: true, website: 'https://example-gov-hosp.gov.in' },
                   { id: '2', name: 'Dr. Sharma Skin Clinic', address: '78 Private Clinic Lane', distance: '4.0 km', estimatedCost: '₹800 - ₹2000 Consultation', schemes: [], isGovernment: false, website: 'https://drsharmaclinic.example.com'},
                   { id: '3', name: 'Community Health Centre (CHC)', address: '45 Health St, Near Post Office', distance: '3.2 km', estimatedCost: 'Nominal Fee / Free (Govt.)', schemes: ['State Scheme'], isGovernment: true },
                   { id: '4', name: 'Urban Primary Health Centre (UPHC)', address: '90 Sector 5, Urban Area', distance: '5.1 km', estimatedCost: 'Free / Minimal Fee (Govt.)', schemes: ['PMJAY Lite'], isGovernment: true },
                   { id: '5', name: 'Apollo Skin Care Center', address: '101 Apollo Ave, Mall Road', distance: '6.8 km', estimatedCost: '₹1200+ Consultation', schemes: [], isGovernment: false },
               ];
              // --- END Placeholder Data ---

               // Sort clinics: Govt first, then by distance
                fetchedClinics.sort((a, b) => {
                    if (a.isGovernment && !b.isGovernment) return -1;  // Govt clinics first
                    if (!a.isGovernment && b.isGovernment) return 1;   // Then non-govt
                    // If both are govt or both are private, sort by distance:
                    const distanceA = parseFloat(a.distance);
                    const distanceB = parseFloat(b.distance);
                    return distanceA - distanceB; //Sort ascending by distance
                });

               setClinicData(fetchedClinics);
               setClinicLoading(false);

           } catch (fetchError: any) {
              console.error("Error fetching clinic data:", fetchError);
              setClinicError(`Failed to fetch clinic data: ${fetchError.message || 'Unknown error'}`);
              setClinicLoading(false);
               toast({
                   variant: "destructive",
                   title: "Clinic Search Failed",
                   description: "Could not retrieve clinic information.",
               });
           }
         },
         (error) => {
           console.error("Error getting location:", error);
           let message = "Could not get your location.";
           if (error.code === error.PERMISSION_DENIED) {
               message = "Location permission denied. Please enable it in your browser settings to search for clinics.";
           } else if (error.code === error.POSITION_UNAVAILABLE) {
               message = "Location information is unavailable.";
           } else if (error.code === error.TIMEOUT) {
               message = "The request to get user location timed out.";
           }
           setClinicError(message);
           setClinicLoading(false);
           toast({
             variant: "destructive",
             title: "Location Error",
             description: message,
           });
         },
         { timeout: 10000 } // Set timeout for location request
       );
     } else {
       console.error("Geolocation is not supported by this browser.");
       setClinicError("Geolocation is not supported by this browser.");
       setClinicLoading(false);
       toast({
         variant: "destructive",
         title: "Geolocation Not Supported",
         description: "Your browser does not support location services.",
       });
     }
   };


  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); // Changed to start for better visibility
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground">
      {/* Enhanced Top Navigation Bar */}
      <nav className="w-full py-2 bg-card shadow-sm sticky top-0 z-50 border-b">
        <div className="container mx-auto flex items-center justify-between px-4">
           <Link href="/" className="flex items-center space-x-2 text-xl font-bold text-primary hover:opacity-90 transition-opacity">
             <HeartPulse className="h-6 w-6" />
             <span>SkinSeva</span>
          </Link>
           <span className="text-muted-foreground text-sm">स्वस्थ जीवन सुखी जीवन</span>
          <div className="flex items-center space-x-1 md:space-x-2">
              <Button variant="ghost" asChild size="sm">
                 <Link href="/" className="text-sm">Home</Link>
              </Button>
              <span className="text-muted-foreground/30 hidden md:inline">|</span>
              <Button variant="ghost" asChild size="sm">
                 <Link href="/skin-info" className="text-sm">Skin Disease Info</Link>
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

      {/* Hero Section */}
       <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center bg-gradient-to-br from-primary/70 via-primary/50 to-secondary/60 dark:from-primary/50 dark:via-primary/40 dark:to-secondary/40 text-white px-4">
         {/* Optional subtle background pattern */}
         <div className="absolute inset-0 opacity-10 bg-[url('/hero-background.svg')] bg-cover bg-center"></div> {/* Example using SVG background */}
         <div className="relative z-10 max-w-4xl mx-auto">
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-foreground drop-shadow-lg">Understand Your Skin Better with AI</h1>
           <p className="text-lg md:text-xl lg:text-2xl mb-8 text-primary-foreground/90 drop-shadow-md max-w-2xl mx-auto">Get a preliminary analysis by answering questions or uploading an image.</p>
           <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {/* Pass the submission handler to the modal */}
              <QuestionnaireModal onSave={handleQuestionnaireSubmit}>
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

      {/* Categories Section - Simplified */}
      <section id="conditions" className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-semibold text-center mb-4">Common Conditions We Analyze</h2>
         <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Our AI provides preliminary insights based on the HAM10000 dataset and common conditions. <Link href="/skin-info" className="text-primary hover:underline">Learn more</Link>.</p>
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

      {/* Upload & Analysis Section */}
      <section id="upload" ref={uploadSectionRef} className="container mx-auto py-16 px-4 bg-gradient-to-b from-background to-secondary/30 dark:to-secondary/20 rounded-lg my-8">
        <div className="max-w-2xl mx-auto">
           <div className="mb-6">
                <ImageUpload onImageUpload={handleFileSelect} loading={loading} currentImagePreview={imagePreview} />
           </div>

            {/* Display questionnaire summary if data exists */}
            {questionnaireData && (
                 <Card className="mb-6 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                    <CardHeader className="p-3">
                         <CardTitle className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2"><ListChecks className="h-4 w-4"/> Assessment Summary Provided</CardTitle>
                     </CardHeader>
                    <CardContent className="p-3 pt-0">
                         <p className="text-xs text-blue-700 dark:text-blue-400">Age: {questionnaireData.age ?? 'N/A'} | Gender: {questionnaireData.gender ?? 'N/A'} | Symptom: {questionnaireData.symptoms ?? 'N/A'}</p>
                         {/* Optionally add more fields */}
                         {/* <p className="text-xs text-blue-700 dark:text-blue-400">Complexion: {questionnaireData.complexion ?? 'N/A'} | Products: {questionnaireData.products ? 'Yes' : 'No'}</p> */}
                     </CardContent>
                 </Card>
             )}


            <Button onClick={handleAnalysis} disabled={loading || (!selectedFile && !questionnaireData)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-6 text-lg py-3">
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                    </>
                ) : 'Analyze Now'}
            </Button>

           <div id="result-section"> {/* Add ID for scrolling */}
                <ResultDisplay result={result} loading={loading && !apiError} apiError={apiError} onFindClinics={handleFindClinics} />
           </div>
        </div>
      </section>


      {/* Educational Section (Simplified) */}
       <section className="w-full bg-secondary dark:bg-secondary/50 py-16">
         <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl font-semibold mb-4">Why Use SkinDeep AI?</h2>
             <p className="text-muted-foreground max-w-3xl mx-auto mb-10">Gain preliminary insights and awareness about potential skin conditions. Remember to consult a professional.</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="bg-card shadow-md text-left p-6 rounded-lg">
                  <CardTitle className="flex items-center gap-2 text-lg mb-2"><AlertCircle className="h-5 w-5 text-primary"/> Early Awareness</CardTitle>
                  <p className="text-sm text-muted-foreground">Identify potential issues early to prompt timely visits to a healthcare professional.</p>
               </Card>
               <Card className="bg-card shadow-md text-left p-6 rounded-lg">
                  <CardTitle className="flex items-center gap-2 text-lg mb-2"><Building className="h-5 w-5 text-primary"/> AI Assistance</CardTitle>
                  <p className="text-sm text-muted-foreground">Our AI analyzes patterns, assisting in recognition and encouraging medical review.</p>
               </Card>
                <Card className="bg-card shadow-md text-left p-6 rounded-lg">
                   <CardTitle className="flex items-center gap-2 text-lg mb-2"><ListChecks className="h-5 w-5 text-primary"/> Informational Tool</CardTitle>
                    <p className="text-sm text-muted-foreground">Use our tool for initial insights, but it's not a substitute for a professional diagnosis.</p>
                </Card>
             </div>
         </div>
       </section>

      {/* Footer Section */}
      <footer className="w-full py-8 bg-card text-muted-foreground border-t mt-16">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 text-center md:text-left">
          <div className="text-xs mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} SkinSeva. All Rights Reserved. <br/>
            <span className="text-destructive font-semibold">Disclaimer: This tool is for informational purposes only and does not provide medical advice.</span>
          </div>
          <div className="flex space-x-4">
            <Link href="/privacy" className="hover:text-primary text-xs">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary text-xs">Terms of Service</Link>
            <Link href="mailto:support@skindeepai.example.com" className="hover:text-primary text-xs">Contact Us</Link>
          </div>
        </div>
      </footer>
       <Chatbot />

        {/* Clinic Results Modal */}
       <ClinicResultsModal
          isOpen={isClinicModalOpen}
          onClose={() => setIsClinicModalOpen(false)}
          clinics={clinicData}
          loading={clinicLoading}
          error={clinicError}
        />
    </div>
  );
}

