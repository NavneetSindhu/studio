
"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle, HeartPulse, Download, Eye, Loader2, MapPin } from "lucide-react"; // Added MapPin
import type { ClassifyImageOutput, QuestionnaireData } from "@/ai/flows/classify-image";
import { useToast } from "@/hooks/use-toast"; // Import useToast for better feedback
import { jsPDF } from "jspdf"; // Import jsPDF

interface ResultsPopupModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: ClassifyImageOutput | null;
    questionnaireData: QuestionnaireData | null;
    imageUri: string | null; // Pass the full data URI
    loading: boolean; // Indicate if the analysis is still loading initially
    apiError: string | null;
    onFindClinics: () => void; // Callback to trigger clinic search
    onViewPdf: () => Promise<void>; // Added prop for viewing PDF
    onDownloadPdf: () => Promise<void>; // Added prop for downloading PDF
}

export function ResultsPopupModal({
    isOpen,
    onClose,
    result,
    questionnaireData,
    imageUri,
    loading,
    apiError,
    onFindClinics, // Receive the handler
    onViewPdf, // Receive PDF view handler
    onDownloadPdf // Receive PDF download handler
}: ResultsPopupModalProps) {

    const [isPdfGenerating, setIsPdfGenerating] = React.useState(false);
    const { toast } = useToast(); // Use toast for feedback

    const handleViewPdfClick = async () => {
        if (!result || !imageUri || isPdfGenerating) return;
        setIsPdfGenerating(true);
        try {
            await onViewPdf(); // Call the passed handler
        } catch (error) {
            console.error("Error in onViewPdf prop:", error);
            toast({ variant: "destructive", title: "PDF Error", description: "Failed to view PDF report." });
        } finally {
            setIsPdfGenerating(false);
        }
    };

    const handleDownloadPdfClick = async () => {
        if (!result || !imageUri || isPdfGenerating) return;
         setIsPdfGenerating(true);
        try {
             await onDownloadPdf(); // Call the passed handler
        } catch (error) {
             console.error("Error in onDownloadPdf prop:", error);
            toast({ variant: "destructive", title: "PDF Error", description: "Failed to download PDF report." });
        } finally {
            setIsPdfGenerating(false);
        }
    };

    // Function to find matching condition details (simplified)
    const getConditionDetails = (predictedDisease: string | undefined) => {
        // Placeholder data matching the main page
        const conditions = [
            { name: "Acne", description: "Common condition with pimples, blackheads.", icon: <CheckCircle /> },
            { name: "Eczema", description: "Causes itchy, red, inflamed skin patches.", icon: <CheckCircle /> },
            { name: "Psoriasis", description: "Autoimmune issue with red, scaly patches.", icon: <CheckCircle /> },
            { name: "Vitiligo", description: "Characterized by loss of skin color in patches.", icon: <CheckCircle /> },
            { name: "Melanoma", description: "Serious skin cancer needing early detection.", icon: <AlertCircle className="text-destructive"/> },
            { name: "Actinic Keratosis (AKIEC)", description: "Rough, scaly patch on sun-exposed skin.", icon: <AlertCircle className="text-amber-600"/> },
            { name: "Basal Cell Carcinoma (BCC)", description: "Pearly or waxy bump, or scar-like lesion.", icon: <AlertCircle className="text-destructive"/> },
            { name: "Benign Keratosis-like Lesions (BKL)", description: "Non-cancerous growths like seborrheic keratoses.", icon: <CheckCircle className="text-green-600"/> },
            { name: "Dermatofibroma (DF)", description: "Small, firm bump, often on lower legs.", icon: <CheckCircle className="text-green-600"/> },
            { name: "Melanocytic Nevi (NV)", description: "Common moles (typically benign).", icon: <CheckCircle className="text-green-600"/> },
            { name: "Vascular Lesions (VASC)", description: "Lesions related to blood vessels (e.g., cherry angiomas).", icon: <HeartPulse className="text-red-400"/> },
            { name: "Unknown/Benign", description: "No specific condition identified or potentially benign.", icon: <CheckCircle className="text-muted-foreground"/> },
            { name: "Image quality is too poor for analysis.", description: "Please upload a clearer image.", icon: <XCircle className="text-destructive"/> },
            { name: "Image does not appear to contain human skin.", description: "Please upload an image of human skin.", icon: <XCircle className="text-destructive"/> },
             { name: "Analysis Inconclusive", description: "The AI could not determine a specific condition.", icon: <AlertCircle className="text-amber-600"/> },
        ];
        return conditions.find(c => c.name.toLowerCase() === predictedDisease?.toLowerCase());
    };

    const conditionDetails = result ? getConditionDetails(result.predictedDisease) : null;
    const isErrorResult = result && (result.predictedDisease.includes("poor for analysis") || result.predictedDisease.includes("not appear to contain human skin"));


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col bg-card"> {/* Ensured card background */}
                <DialogHeader>
                    <DialogTitle>{loading ? "Analyzing..." : apiError ? "Analysis Failed" : "Analysis Complete"}</DialogTitle>
                    {!loading && !apiError && (
                        <DialogDescription>
                            Here are the potential findings based on the provided information. Remember to consult a doctor.
                        </DialogDescription>
                    )}
                     {loading && (
                         <DialogDescription>
                             Please wait while the AI processes your request.
                         </DialogDescription>
                     )}
                     {apiError && (
                         <DialogDescription>
                            An error occurred during analysis. See details below.
                         </DialogDescription>
                     )}
                </DialogHeader>

                <div className="flex-grow overflow-y-auto p-1 pr-4 -mr-4 space-y-6 min-h-[200px]"> {/* Added min-height */}
                    {loading ? (
                         <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <Loader2 className="animate-spin h-10 w-10 text-primary" />
                            <p className="text-sm text-muted-foreground">Analyzing... Please wait.</p>
                        </div>
                    ) : apiError ? (
                        <Alert variant="destructive" className="m-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Analysis Failed</AlertTitle>
                            <AlertDescription>
                                {apiError} Please close this popup and try again.
                            </AlertDescription>
                        </Alert>
                    ) : result && imageUri ? (
                        <>
                            {/* Result Details */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Side: Image & Questionnaire Summary */}
                                <div className="space-y-4">
                                    <div className="border rounded-md p-3 bg-muted/30">
                                        <h3 className="font-semibold mb-2 text-center">Uploaded Image</h3>
                                        <div className="aspect-square relative w-full max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                                             <Image
                                                src={imageUri}
                                                alt="Uploaded skin analysis"
                                                layout="fill"
                                                objectFit="contain"
                                                onError={(e) => { e.currentTarget.src = 'https://picsum.photos/seed/placeholder/200'; }} // Fallback image
                                             />
                                        </div>
                                    </div>
                                    {questionnaireData && (
                                        <div className="border rounded-md p-3 text-xs space-y-1 bg-muted/30">
                                             <h4 className="font-semibold mb-1">Patient Details Summary</h4>
                                            <p><span className="font-medium">Age:</span> {questionnaireData.age ?? 'N/A'}</p>
                                            <p><span className="font-medium">Gender:</span> {questionnaireData.gender ?? 'N/A'}</p>
                                            <p><span className="font-medium">Complexion:</span> {questionnaireData.complexion ?? 'N/A'}</p>
                                            <p><span className="font-medium">Symptoms:</span> {questionnaireData.symptoms ?? 'N/A'}</p>
                                            <p><span className="font-medium">Products:</span> {questionnaireData.products || 'N/A'}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Prediction & Notes */}
                                <div className="space-y-4">
                                     <div className="border rounded-md p-4 bg-background"> {/* Changed background */}
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                             {conditionDetails?.icon || <HeartPulse className="h-5 w-5 text-primary flex-shrink-0"/>}
                                            Prediction: {result.predictedDisease}
                                        </h3>
                                        {conditionDetails?.description && <p className="text-sm text-muted-foreground mb-3">{conditionDetails.description}</p>}

                                        {/* Only show confidence if it's not an image error message */}
                                         {!isErrorResult && (
                                            <div>
                                                <p className="text-sm font-medium mb-1">Confidence Score:</p>
                                                <div className="flex items-center space-x-2">
                                                <Progress value={result.confidencePercentage} className="flex-1 h-2.5 rounded-full"/>
                                                <span className="text-sm font-semibold">{result.confidencePercentage.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                         )}

                                        {result.notes && (
                                        <div className="text-sm border-l-4 border-primary pl-3 py-1 bg-primary/10 mt-4">
                                            <p className="font-medium text-primary">AI Notes:</p>
                                            <p className="text-foreground/80 whitespace-pre-wrap">{result.notes}</p>
                                        </div>
                                        )}
                                    </div>

                                     {/* Add Find Clinics button here if analysis is successful */}
                                     {!isErrorResult && (
                                        <Button onClick={() => { onClose(); onFindClinics(); }} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                            <MapPin className="mr-2 h-4 w-4" /> Find Nearby Clinic
                                        </Button>
                                     )}

                                     <Alert variant="warning">
                                        <AlertCircle className="h-4 w-4"/>
                                        <AlertTitle className="font-semibold">Important Disclaimer</AlertTitle>
                                        <AlertDescription>
                                            This AI analysis is for informational purposes only and is **not** a medical diagnosis. Always consult a qualified dermatologist or healthcare professional.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                             </div>
                        </>
                    ) : (
                        <div className="p-6 text-center text-muted-foreground">
                            <p>Analysis complete, but no result data available.</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4 pt-4 border-t flex-col sm:flex-row gap-2">
                     <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Close
                        </Button>
                     </DialogClose>
                      {/* Only show PDF buttons if analysis was successful (not loading, no error, not an image quality issue) */}
                    {!loading && !apiError && result && !isErrorResult && imageUri && (
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                onClick={handleViewPdfClick} // Use the new handler
                                variant="secondary"
                                disabled={isPdfGenerating}
                                className="flex-1 sm:flex-none" // Ensure buttons fit on mobile
                            >
                                {isPdfGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Eye className="mr-2 h-4 w-4" />}
                                View Report
                            </Button>
                            <Button
                                onClick={handleDownloadPdfClick} // Use the new handler
                                variant="default"
                                disabled={isPdfGenerating}
                                className="flex-1 sm:flex-none" // Ensure buttons fit on mobile
                            >
                                {isPdfGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                                Download Report
                            </Button>
                        </div>
                     )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    