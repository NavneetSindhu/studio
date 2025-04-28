
"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertCircle, HeartPulse, Download, Eye, Loader2 } from "lucide-react";
import type { ClassifyImageOutput, QuestionnaireData } from "@/ai/flows/classify-image";
import { generatePdfReport, viewPdf, downloadPdf } from "@/lib/pdfUtils"; // Import PDF utilities

interface ResultsPopupModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: ClassifyImageOutput | null;
    questionnaireData: QuestionnaireData | null;
    imageUri: string | null; // Pass the full data URI
    loading: boolean; // Indicate if the analysis is still loading initially
    apiError: string | null;
}

export function ResultsPopupModal({
    isOpen,
    onClose,
    result,
    questionnaireData,
    imageUri,
    loading,
    apiError
}: ResultsPopupModalProps) {

    const [isPdfGenerating, setIsPdfGenerating] = React.useState(false);

    const handleViewPdf = () => {
        if (!result || !imageUri || isPdfGenerating) return;
        setIsPdfGenerating(true);
        try {
            const doc = generatePdfReport(result, questionnaireData, imageUri);
            viewPdf(doc);
        } catch (error) {
            console.error("Error generating or viewing PDF:", error);
            alert("Failed to generate or view PDF report."); // Replace with a toast message ideally
        } finally {
            setIsPdfGenerating(false);
        }
    };

    const handleDownloadPdf = () => {
        if (!result || !imageUri || isPdfGenerating) return;
         setIsPdfGenerating(true);
        try {
             const doc = generatePdfReport(result, questionnaireData, imageUri);
             downloadPdf(doc, `SkinSewa_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
             console.error("Error generating or downloading PDF:", error);
             alert("Failed to generate or download PDF report."); // Replace with a toast message ideally
        } finally {
            setIsPdfGenerating(false);
        }
    };

    // Function to find matching condition details (simplified)
    const getConditionDetails = (predictedDisease: string | undefined) => {
        // In a real app, fetch this from a data source or have it globally available
        const conditions = [
            { name: "Acne Vulgaris", description: "Common condition with pimples, blackheads.", icon: <CheckCircle /> },
            { name: "Eczema (Atopic Dermatitis)", description: "Causes itchy, red, inflamed skin patches.", icon: <CheckCircle /> },
            // Add other conditions...
        ];
        return conditions.find(c => c.name.toLowerCase() === predictedDisease?.toLowerCase());
    };

    const conditionDetails = result ? getConditionDetails(result.predictedDisease) : null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Analysis Complete</DialogTitle>
                    <DialogDescription>
                        Here are the potential findings based on the provided information.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-grow overflow-y-auto p-1 pr-4 -mr-4 space-y-6">
                    {loading ? (
                         <div className="flex flex-col items-center justify-center h-40 space-y-4">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                            <p className="text-sm text-muted-foreground">Analyzing... Please wait.</p>
                        </div>
                    ) : apiError ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Analysis Failed</AlertTitle>
                            <AlertDescription>
                                {apiError} Please try again.
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
                                        <div className="aspect-video relative w-full max-w-xs mx-auto bg-gray-200 rounded overflow-hidden">
                                             <Image
                                                src={imageUri}
                                                alt="Uploaded skin analysis"
                                                layout="fill"
                                                objectFit="contain"
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
                                     <div className="border rounded-md p-4 bg-card">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <HeartPulse className="h-5 w-5 text-primary"/>
                                            Predicted Condition: {result.predictedDisease}
                                        </h3>
                                        {conditionDetails && <p className="text-sm text-muted-foreground mb-3">{conditionDetails.description}</p>}

                                        <div>
                                            <p className="text-sm font-medium mb-1">Confidence Score:</p>
                                            <div className="flex items-center space-x-2">
                                            <Progress value={result.confidencePercentage} className="flex-1 h-2.5 rounded-full"/>
                                            <span className="text-sm font-semibold">{result.confidencePercentage.toFixed(1)}%</span>
                                            </div>
                                        </div>

                                        {result.notes && (
                                        <div className="text-sm border-l-4 border-primary pl-3 py-1 bg-primary/10 mt-4">
                                            <p className="font-medium text-primary">AI Notes:</p>
                                            <p className="text-foreground/80 whitespace-pre-wrap">{result.notes}</p>
                                        </div>
                                        )}
                                    </div>

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
                            <p>No analysis results available.</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4 pt-4 border-t flex-col sm:flex-row gap-2">
                     <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Close
                        </Button>
                     </DialogClose>
                    <div className="flex gap-2">
                        <Button
                             onClick={handleViewPdf}
                             variant="secondary"
                             disabled={!result || !imageUri || loading || isPdfGenerating}
                             className="flex-1"
                         >
                             {isPdfGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Eye className="mr-2 h-4 w-4" />}
                            View Report PDF
                         </Button>
                        <Button
                             onClick={handleDownloadPdf}
                             variant="default"
                             disabled={!result || !imageUri || loading || isPdfGenerating}
                             className="flex-1"
                         >
                             {isPdfGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Download className="mr-2 h-4 w-4" />}
                             Download Report PDF
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
