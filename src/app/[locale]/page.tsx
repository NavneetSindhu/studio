
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image"; // Use next/image for optimization
import { classifyImage, ClassifyImageOutput, QuestionnaireData } from "@/ai/flows/classify-image";
import { chatWithBot, ChatInput, ChatOutput } from "@/ai/flows/chat-flow"; // Import chat flow
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // Added CardFooter
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertCircle, Upload, ListChecks, HeartPulse, MapPin, Languages, Building, MessageSquare, Loader2, Leaf, ChevronRight, FileText, History, Eye, Download, Info } from "lucide-react"; // Added PDF icons, Info
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { QuestionnaireModal } from "@/components/QuestionnaireModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ClinicResultsModal, ClinicInfo } from "@/components/ClinicResultsModal";
import { ResultsPopupModal } from "@/components/ResultsPopupModal"; // Import the new results popup
import { generatePdfReport, viewPdf, downloadPdf } from "@/lib/pdfUtils"; // Import PDF utilities
import { format } from 'date-fns'; // For formatting dates
import { jsPDF } from "jspdf"; // Import jsPDF explicitly


// --- Session Report Type ---
interface PastReport {
    id: string;
    timestamp: number;
    predictedDisease: string;
    confidencePercentage: number;
    imageUri: string; // Store image preview/thumbnail URI
    questionnaireSummary?: string; // Optional summary of questionnaire
    pdfDataUri?: string; // Store the generated PDF data IN RUNTIME STATE
}

// --- Skin Conditions Data (For display purposes) ---
const skinConditions = [
    { name: "Acne Vulgaris", description: "Common condition with pimples, blackheads.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-inherit opacity-70"><circle cx="12" cy="8" r="1"/><circle cx="10" cy="13" r="1"/><circle cx="14" cy="13" r="1"/><circle cx="12" cy="17" r="1"/><path d="M12 2a10 10 0 1 0 10 10 A10 10 0 0 0 12 2z"/></svg> },
    { name: "Eczema (Atopic Dermatitis)", description: "Causes itchy, red, inflamed skin patches.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-inherit opacity-70"><path d="M12 2c-3 0-5 2-8 2s-5-2-8-2c-3 0-5 2-5 5s2 5 5 5c0 3-2 5-2 8s2 5 5 5 5-2 8-2 5 2 8 2 5-2 5-5-2-5-2-8 2-5 5-5-2-5-5-5c-3 0-5 2-8 2s-5-2-8-2z"/><path d="M14 14a2 2 0 1 0-4 0 2 2 0 0 0 4 0z"/><path d="M10 10c.5-1 2-2 4-2"/><path d="M14 10c-.5 1-2 2-4 2"/></svg> },
    { name: "Psoriasis", description: "Autoimmune issue with red, scaly patches.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-inherit opacity-70"><path d="M12 14c-4.5 0-8-3.5-8-8s3.5-8 8-8 8 3.5 8 8-3.5 8-8 8z"/><path d="M12 14c2 0 4-2 4-4s-2-4-4-4-4 2-4 4 2 4 4 4z"/><path d="M12 22c4.5 0 8-3.5 8-8s-3.5-8-8-8-8 3.5-8 8 3.5 8 8 8z"/></svg> },
    { name: "Vitiligo", description: "Characterized by loss of skin color in patches.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-inherit opacity-70"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 12a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" fill="currentColor" fillOpacity="0.3"/><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg> },
    { name: "Melanoma", description: "Serious skin cancer needing early detection.", icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-destructive opacity-70"><path d="m12 2-10 18h20L12 2z"/><line x1="12" x2="12" y1="8" y2="14"/><line x1="12" x2="12.01" y1="18"/></svg> },
    { name: "Actinic Keratosis (AKIEC)", description: "Rough, scaly patch on sun-exposed skin.", icon: <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400 opacity-70" /> },
    { name: "Basal Cell Carcinoma (BCC)", description: "Pearly or waxy bump, or scar-like lesion.", icon: <AlertCircle className="h-8 w-8 text-destructive opacity-70" /> },
    { name: "Benign Keratosis-like Lesions (BKL)", description: "Non-cancerous growths like seborrheic keratoses.", icon: <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 opacity-70" /> },
    { name: "Dermatofibroma (DF)", description: "Small, firm bump, often on lower legs.", icon: <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 opacity-70" /> },
    { name: "Melanocytic Nevi (NV)", description: "Common moles (typically benign).", icon: <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 opacity-70" /> },
    { name: "Vascular Lesions (VASC)", description: "Lesions related to blood vessels (e.g., cherry angiomas).", icon: <HeartPulse className="h-8 w-8 text-red-400 opacity-70" /> },
];

// --- Scrolling Disease List Component ---
const scrollingDiseaseList = [
  "Acne", "Eczema", "Psoriasis", "Melanoma", "Rosacea",
  "Dermatitis", "Hives", "Ringworm", "Cellulitis", "Seborrheic Dermatitis"
];
function ScrollingDiseaseList() {
    const extendedList = [...scrollingDiseaseList, ...scrollingDiseaseList];
    return (
        <div className="w-full overflow-hidden bg-secondary/50 py-3 my-12 relative border-y border-border">
            <div className="animate-scrollRightToLeft flex whitespace-nowrap">
                {extendedList.map((disease, index) => (
                    <span key={index} className="mx-4 text-sm text-muted-foreground font-medium">
                        {disease}
                    </span>
                ))}
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background pointer-events-none"></div> {/* Fades */}
        </div>
    );
}

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

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
    <Card className="bg-card rounded-lg overflow-hidden"> {/* Added styling */}
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Upload Your Image</CardTitle> {/* Improved typography */}
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
      </CardContent>
    </Card>
  );
}


// --- Chatbot Component ---
function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>([
        { text: "Hello! How can I help you with your skin concerns today?", sender: "bot" }
    ]);
    const [newMessage, setNewMessage] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling
    const { toast } = useToast(); // Use toast for error feedback

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    // Scroll to bottom of chat messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom(); // Scroll when chat opens and messages change
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (newMessage.trim() !== "" && !isBotTyping) {
            const userMessage = { text: newMessage, sender: "user" as const };
            setMessages(prev => [...prev, userMessage]);
            const currentMessage = newMessage; // Capture message before clearing
            setNewMessage("");
            setIsBotTyping(true);

            try {
                 // Prepare only necessary history to avoid overly large context
                 const historyToSend = messages.slice(-6).map(msg => ({ // Send last 6 messages max
                    text: msg.text,
                    sender: msg.sender
                 }));
                const chatInput: ChatInput = { message: currentMessage, history: historyToSend }; // Include history
                console.log("Sending to chatFlow:", chatInput); // Debug log
                const botResponse: ChatOutput = await chatWithBot(chatInput);
                console.log("Received from chatFlow:", botResponse); // Debug log
                const botMessage = { text: botResponse.response, sender: "bot" as const };
                setMessages(prev => [...prev, botMessage]);
            } catch (error) {
                console.error("Error calling chatbot flow:", error);
                toast({
                    variant: "destructive",
                    title: "Chat Error",
                    description: "Sorry, I couldn't connect to the AI assistant. Please try again later.",
                });
                const errorMessage = { text: "Sorry, I encountered an error. Please try again.", sender: "bot" as const };
                setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsBotTyping(false);
            }
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <Button size="lg" onClick={toggleChat} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg pl-4 pr-5 py-6">
                   <MessageSquare className="h-5 w-5 mr-2" />
                   <span>Chat</span>
                </Button>
            ) : (
                <Card className="w-80 shadow-lg flex flex-col max-h-[60vh] bg-card"> {/* Ensure card background */}
                    <CardHeader className="flex flex-row items-center justify-between p-3 border-b flex-shrink-0">
                         <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                               <AvatarImage src="https://picsum.photos/seed/aichat/200" alt="Chatbot Avatar" />
                               <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                             <CardTitle className="text-sm font-semibold">SkinSewa AI Assistant</CardTitle>
                         </div>
                        <Button size="icon" variant="ghost" onClick={toggleChat} className="h-6 w-6">
                            <XCircle className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-y-auto p-3 space-y-2">
                        {messages.map((message, index) => (
                            <div key={index} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                                <span className={cn("inline-block p-2 rounded-lg text-xs max-w-[80%]",
                                    message.sender === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary text-secondary-foreground rounded-bl-none")}>
                                    {message.text}
                                </span>
                            </div>
                        ))}
                        {isBotTyping && (
                             <div className="flex justify-start">
                                <span className="inline-block p-2 rounded-lg text-xs max-w-[80%] bg-secondary text-secondary-foreground rounded-bl-none">
                                    <Loader2 className="h-3 w-3 animate-spin inline-block mr-1" /> Typing...
                                </span>
                             </div>
                        )}
                        <div ref={messagesEndRef} /> {/* Element to scroll to */}
                    </CardContent>
                    <div className="p-2 flex space-x-2 border-t flex-shrink-0">
                        <Input
                            type="text"
                            placeholder="Ask a question..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !isBotTyping) handleSendMessage(); }}
                            className="h-8 text-xs"
                            disabled={isBotTyping}
                        />
                        <Button onClick={handleSendMessage} size="sm" className="h-8" disabled={isBotTyping}>
                             {isBotTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}


// --- Type for report data stored in Session Storage (less data) ---
interface StoredReportData {
    id: string;
    timestamp: number;
    predictedDisease: string;
    confidencePercentage: number;
    imageUriPreview: string; // Smaller URI for storage efficiency
    questionnaireSummary?: string;
}

// --- Past Reports Section ---
function PastReportsSection({ reports, onViewPdf, onDownloadPdf }: { reports: PastReport[], onViewPdf: (report: PastReport) => void, onDownloadPdf: (report: PastReport) => void }) {
    if (!reports || reports.length === 0) {
        return (
            <section id="past-reports" className="container mx-auto py-12 px-4">
                 <Card className="bg-card rounded-lg"> {/* Wrap section content in Card */}
                   <CardHeader>
                     <h2 className="text-2xl font-semibold text-center mb-4 flex items-center justify-center gap-2">
                       <History className="h-6 w-6"/> Past Analysis Reports
                     </h2>
                   </CardHeader>
                   <CardContent>
                      <p className="text-center text-muted-foreground">No reports available yet.</p>
                   </CardContent>
                 </Card>
            </section>
        );
    }

    return (
        <section id="past-reports" className="container mx-auto py-12 px-4">
            <Card className="bg-card rounded-lg"> {/* Wrap section content in Card */}
              <CardHeader>
                 <h2 className="text-3xl font-semibold text-center mb-8 flex items-center justify-center gap-2">
                     <History className="h-7 w-7"/> Past Analysis Reports
                 </h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {reports.map((report) => (
                        <Card key={report.id} className="overflow-hidden text-sm bg-background shadow-md hover:shadow-lg transition-shadow duration-300"> {/* Nested card styling */}
                            <CardHeader className="p-3 pb-1">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-base">{report.predictedDisease}</CardTitle>
                                    <span className="text-xs text-muted-foreground">
                                        {format(new Date(report.timestamp), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <CardDescription className="text-xs">
                                    Confidence: {report.confidencePercentage.toFixed(1)}%
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-3 pt-1">
                                <div className="aspect-square relative w-full bg-muted rounded overflow-hidden mb-2">
                                    <Image
                                        src={report.imageUri} // Use the full URI stored in state for display
                                        alt={`Report ${report.id}`}
                                        fill // Use fill instead of layout="fill"
                                        style={{ objectFit: "cover" }} // Use style prop for objectFit
                                        onError={(e) => { e.currentTarget.src = 'https://picsum.photos/seed/placeholder/200'; }} // Fallback
                                    />
                                </div>
                                <div className="flex gap-1 justify-end">
                                    <Button variant="outline" size="sm" onClick={() => onViewPdf(report)} className="text-xs h-7 px-2" disabled={!report.pdfDataUri}>
                                        <Eye className="h-3 w-3 mr-1"/> View PDF
                                    </Button>
                                    <Button variant="default" size="sm" onClick={() => onDownloadPdf(report)} className="text-xs h-7 px-2" disabled={!report.pdfDataUri}>
                                        <Download className="h-3 w-3 mr-1"/> DL PDF
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
        </section>
    );
}


// --- Main Home Component ---
export default function Home({ params }: { params: { locale: string } }) { // Accept locale param
  // State for analysis results and errors
  const [result, setResult] = useState<ClassifyImageOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // State for UI elements
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Store full data URI for preview & PDF
  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData | null>(null);
  const [isClinicModalOpen, setIsClinicModalOpen] = useState(false);
  const [clinicData, setClinicData] = useState<ClinicInfo[] | null>(null);
  const [clinicLoading, setClinicLoading] = useState(false);
  const [clinicError, setClinicError] = useState<string | null>(null);
  const [isResultsPopupOpen, setIsResultsPopupOpen] = useState(false);
  const [pastReports, setPastReports] = useState<PastReport[]>([]); // State for past reports (includes full image URI and pdfDataUri)


  const uploadSectionRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  // --- Load past reports from session storage on mount ---
  useEffect(() => {
    try {
      const storedReportsJson = sessionStorage.getItem('pastSkinReports');
      if (storedReportsJson) {
          const storedReportsData: StoredReportData[] = JSON.parse(storedReportsJson);
           // Convert stored data (without full image/PDF) back to PastReport format
           const loadedReports: PastReport[] = storedReportsData.map(storedReport => ({
                ...storedReport,
                imageUri: storedReport.imageUriPreview, // Use the stored preview URI
                pdfDataUri: undefined, // PDF data is not stored, needs regeneration if view/download is clicked later
           }));
           setPastReports(loadedReports);
           console.log("Loaded past reports from session storage.");
      }
    } catch (e) {
        console.error("Failed to load past reports from session storage:", e);
    }
  }, []);

  // --- Save past reports to session storage when they change ---
   useEffect(() => {
    try {
        // Convert PastReport state (with full URIs) to StoredReportData (smaller URIs) for storage
        const reportsToStore: StoredReportData[] = pastReports.map(r => ({
             id: r.id,
             timestamp: r.timestamp,
             predictedDisease: r.predictedDisease,
             confidencePercentage: r.confidencePercentage,
             // Store a smaller preview or placeholder if URI is too large
             imageUriPreview: r.imageUri.length > 5000 ? r.imageUri.substring(0, 100) + '...' : r.imageUri,
             questionnaireSummary: r.questionnaireSummary,
             // pdfDataUri is intentionally omitted from session storage
        })).filter(r => r.imageUriPreview); // Filter out potentially invalid previews

        sessionStorage.setItem('pastSkinReports', JSON.stringify(reportsToStore));
         console.log("Saved past reports overview to session storage.");
    } catch (e) {
        console.error("Failed to save past reports to session storage:", e);
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
             toast({ variant: "destructive", title: "Storage Full", description: "Could not save full report history. Session storage is full. Older reports might be lost." });
        } else {
             toast({ variant: "destructive", title: "Storage Error", description: "Could not save report history." });
        }
    }
  }, [pastReports, toast]); // Add toast to dependencies


  // Handle file selection from ImageUpload component
  const handleFileSelect = (file: File | null) => {
      setSelectedFile(file);
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              const dataUri = reader.result as string;
              setImagePreview(dataUri); // Store the full data URI
          };
          reader.readAsDataURL(file);
           setResult(null); // Reset results on new image
           setApiError(null);
           setIsResultsPopupOpen(false); // Close popup if open on new image upload
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
    setResult(null); // Reset results if assessment changes
    setApiError(null);
    setIsResultsPopupOpen(false); // Close popup if assessment changes
  };


   // --- Function to add a report to past reports state ---
   const addPastReport = async (reportData: ClassifyImageOutput, qData: QuestionnaireData | null, imgUri: string) => {
       const reportId = `report-${Date.now()}`; // Simple unique ID
       const timestamp = Date.now();

       let pdfDataUri: string | undefined = undefined;
       try {
           // Generate PDF immediately when the analysis is done
           const doc = generatePdfReport(reportData, qData, imgUri);
           pdfDataUri = doc.output('datauristring'); // Generate the data URI
           console.log("Generated PDF Data URI for report", reportId);
       } catch (pdfError) {
           console.error("Failed to generate PDF for past report:", pdfError);
           toast({ variant: "destructive", title: "PDF Generation Failed", description: "Could not generate PDF for this report." });
           // Proceed without PDF data if generation fails
       }

        // Find the correct timestamp associated with the result if available
        const resultTimestamp = (reportData as any).timestamp || timestamp; // Fallback to current time

       const newReport: PastReport = {
           id: reportId,
           timestamp: resultTimestamp, // Use timestamp from result if possible
           predictedDisease: reportData.predictedDisease,
           confidencePercentage: reportData.confidencePercentage,
           imageUri: imgUri, // Store the full image data URI in the runtime state
           questionnaireSummary: qData ? `Age: ${qData.age ?? 'N/A'}, Symptom: ${qData.symptoms ?? 'N/A'}` : undefined,
           pdfDataUri: pdfDataUri, // Store the generated PDF data URI in the runtime state
       };

       setPastReports(prevReports => {
            const updatedReports = [newReport, ...prevReports];
            const MAX_REPORTS_IN_MEMORY = 10; // Limit reports stored in memory/state
            return updatedReports.slice(0, MAX_REPORTS_IN_MEMORY);
       });
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
    if (!selectedFile || !imagePreview) { // Also check for imagePreview (data URI)
         toast({
           variant: "destructive",
           title: "Image Required",
           description: "Image upload is required for reliable analysis.",
         });
         return;
     }


    console.log("Starting analysis...");
    setLoading(true); // Set loading state for UI feedback
    setApiError(null);
    setResult(null); // Clear previous results
    setIsResultsPopupOpen(true); // *** Open the popup immediately ***

    try {
        const imageUri = imagePreview;

        // Placeholders - the flow handles actual image quality checks
        const isClearImage = true;
        const hasHumanSkinContent = true;

        console.log("Calling classifyImage API with:", { imageUri: 'URI_preview_omitted', questionnaireData, isClear: isClearImage, hasHumanSkin: hasHumanSkinContent });

        try {
            const apiResult = await classifyImage({
                imageUri: imageUri,
                questionnaireData: questionnaireData || undefined,
                isClear: isClearImage, // Flow now uses the image directly
                hasHumanSkin: hasHumanSkinContent, // Flow now uses the image directly
            });
             // Add a timestamp to the result object for later identification
             const resultWithTimestamp = { ...apiResult, timestamp: Date.now() };
            console.log("API Response:", resultWithTimestamp);


             // Check for specific error messages related to image quality from the flow itself
             if (resultWithTimestamp && typeof resultWithTimestamp.predictedDisease === 'string' && (resultWithTimestamp.predictedDisease.includes("poor for analysis") || resultWithTimestamp.predictedDisease.includes("not appear to contain human skin"))) {
                 setApiError(resultWithTimestamp.predictedDisease);
                 setResult(resultWithTimestamp); // Set the result even if it's an error message for display
                 toast({
                    variant: "warning", // Changed to warning
                    title: "Analysis Issue",
                    description: resultWithTimestamp.predictedDisease,
                   });
             } else if (resultWithTimestamp && resultWithTimestamp.predictedDisease && typeof resultWithTimestamp.confidencePercentage === 'number') {
                setResult(resultWithTimestamp); // Set the successful result
                setApiError(null); // Clear previous errors
                console.log("Classification successful:", resultWithTimestamp);
                // Add to past reports state after successful analysis (includes PDF generation)
                 await addPastReport(resultWithTimestamp, questionnaireData, imageUri);
             } else {
                 console.error("Invalid API response structure:", apiResult);
                 setApiError("Received an unexpected result from the analysis service.");
                 setResult(null); // Keep result null on error
                 toast({
                    variant: "destructive",
                    title: "Analysis Error",
                    description: "Received an unexpected result from the analysis service.",
                  });
             }

        } catch (innerError: any) {
             console.error("Error during classifyImage API call:", innerError);
             let errorMessage = "Failed to classify the image due to an unexpected error.";
             if (innerError instanceof Error) {
                  if (innerError.message.includes('deadline')) {
                      errorMessage = "Analysis timed out. The server might be busy. Please try again.";
                  } else if (innerError.message.includes('output')) {
                       errorMessage = "The AI failed to generate a valid analysis. Please check the image or try again.";
                  } else {
                      errorMessage = `Failed to classify the image: ${innerError.message}`;
                  }
             }
             setApiError(errorMessage);
             setResult(null); // Keep result null on error
             toast({
                variant: "destructive",
                title: "Analysis Error",
                description: errorMessage,
              });
        } finally {
             setLoading(false); // Stop loading AFTER getting result or error
             console.log("Finished image classification attempt.");
        }

    } catch (error) {
      console.error("Error preparing analysis:", error);
      setApiError("An error occurred before starting the analysis.");
      setLoading(false); // Stop loading on setup error
      setIsResultsPopupOpen(false); // Close popup if setup fails
       toast({
            variant: "destructive",
            title: "Setup Error",
            description: "An error occurred before starting the analysis.",
        });
    }
  };


   // --- Find Clinics Logic ---
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

           try {
              await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

               const fetchedClinics: ClinicInfo[] = [ // Placeholder Data
                   { id: '1', name: 'District General Hospital - Dermatology Dept.', address: 'Govt. Hospital Road, City', distance: '1.5 km', estimatedCost: 'Free under PMJAY/State Scheme', schemes: ['PMJAY', 'State Scheme'], isGovernment: true, website: 'https://example-gov-hosp.gov.in', lat: latitude + 0.01, lon: longitude + 0.01 },
                   { id: '2', name: 'Dr. Sharma Skin Clinic', address: '78 Private Clinic Lane', distance: '4.0 km', estimatedCost: '₹800 - ₹2000 Consultation', schemes: [], isGovernment: false, website: 'https://drsharmaclinic.example.com', lat: latitude - 0.02, lon: longitude - 0.01},
                   { id: '3', name: 'Community Health Centre (CHC)', address: '45 Health St, Near Post Office', distance: '3.2 km', estimatedCost: 'Nominal Fee / Free (Govt.)', schemes: ['State Scheme'], isGovernment: true, lat: latitude + 0.005, lon: longitude - 0.015 },
                   { id: '4', name: 'Urban Primary Health Centre (UPHC)', address: '90 Sector 5, Urban Area', distance: '5.1 km', estimatedCost: 'Free / Minimal Fee (Govt.)', schemes: ['PMJAY Lite'], isGovernment: true, lat: latitude - 0.01, lon: longitude + 0.02 },
                   { id: '5', name: 'Apollo Skin Care Center', address: '101 Apollo Ave, Mall Road', distance: '6.8 km', estimatedCost: '₹1200+ Consultation', schemes: [], isGovernment: false, lat: latitude + 0.03, lon: longitude },
               ];

               fetchedClinics.sort((a, b) => {
                   if (a.isGovernment !== b.isGovernment) return a.isGovernment ? -1 : 1;
                   const distanceA = parseFloat(a.distance);
                   const distanceB = parseFloat(b.distance);
                   return (isNaN(distanceA) || isNaN(distanceB)) ? 0 : distanceA - distanceB;
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
         { timeout: 10000 }
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


   // --- Functions to handle PDF viewing/downloading for Past Reports ---
    const handleViewPastReportPdf = async (report: PastReport) => {
        console.log("Attempting to view PDF for report:", report.id, "URI exists:", !!report.pdfDataUri);
        if (!report.pdfDataUri) {
            toast({ variant: "destructive", title: "PDF Not Available", description: "The PDF for this report is not currently available." });
            // Optionally add regeneration logic here if needed, similar to handleDownload
            return;
        }
        try {
            viewPdf(report.pdfDataUri);
        } catch (e) {
           console.error("Error viewing PDF from Data URI:", e);
           toast({ variant: "destructive", title: "PDF Error", description: "Could not display the PDF report." });
        }
    };

    const handleDownloadPastReportPdf = async (report: PastReport) => {
         console.log("Attempting to download PDF for report:", report.id, "URI exists:", !!report.pdfDataUri);
        if (!report.pdfDataUri) {
             toast({ variant: "destructive", title: "PDF Not Available", description: "The PDF for this report cannot be downloaded currently." });
             // Optionally add regeneration logic here if needed
             return;
        }
        try {
             downloadPdf(report.pdfDataUri, `SkinSewa_Report_${format(new Date(report.timestamp), 'yyyy-MM-dd_HHmm')}.pdf`);
         } catch (error) {
             console.error("Error downloading PDF:", error);
             toast({ variant: "destructive", title: "Download Failed", description: "Could not download the PDF report." });
         }
    };


  // --- Scroll to Past Reports Section ---
  const scrollToPastReports = () => {
    const pastReportsSection = document.getElementById('past-reports');
    pastReportsSection?.scrollIntoView({ behavior: "smooth", block: "start" });
  };


  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // --- Helper function to create a PDF document instance from data URI ---
  // This is needed because viewPdf and downloadPdf might need the jsPDF object
  // If regeneration happens, they get it directly. If viewing/downloading existing,
  // this function helps (though viewPdf utility directly handles data URI now).
  const getPdfDocFromUri = (dataUri: string): jsPDF | null => {
      try {
          // Note: jsPDF doesn't directly load from a data URI.
          // The viewPdf and downloadPdf utilities now handle the data URI directly.
          // This function might be less necessary now but kept for potential future use cases
          // where the jsPDF object itself is needed from a stored URI.
          console.warn("Creating a new jsPDF instance; direct loading from data URI is not supported by jsPDF.");
          // Return null or handle appropriately as direct loading isn't straightforward.
          return null;
      } catch (error) {
          console.error("Error processing PDF Data URI:", error);
          return null;
      }
  };


  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground">

      {/* Enhanced Header */}
       <nav className="w-full py-3 bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between px-4 relative">
              <Link href={`/${params.locale}`} className="flex items-center space-x-2 text-3xl font-bold hover:opacity-90 transition-opacity">
                  <span>Skin</span><span className="header-logo-sewa">Sewa</span>
              </Link>
              <span className="text-sm opacity-80 absolute left-1/2 -translate-x-1/2 hidden lg:inline">
                  स्वस्थ जीवन सुखी जीवन
              </span>
              <div className="flex items-center space-x-2 md:space-x-4">
                  {/* Navigation Links */}
                  <div className="hidden md:flex items-center space-x-4">
                       <Button variant="ghost" asChild size="sm" className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
                           <Link href={`/${params.locale}`} className="text-sm flex items-center gap-1"><Leaf className="h-4 w-4 text-accent"/>Home</Link>
                       </Button>
                       <Button variant="ghost" asChild size="sm" className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
                           <Link href={`/${params.locale}/skin-info`} className="text-sm">Skin Disease Info</Link>
                       </Button>
                       {/* Button to access Past Reports */}
                       <Button
                           variant="ghost"
                           size="sm"
                           className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground flex items-center gap-1"
                           onClick={scrollToPastReports} // Scroll to past reports section
                           disabled={pastReports.length === 0} // Disable if no reports
                        >
                          <History className="h-4 w-4" /> Past Reports
                       </Button>
                  </div>

                 {/* Doctor Image */}
                 <div className="absolute right-0 top-full md:top-0 h-20 w-20 md:h-28 md:w-28 pointer-events-none -mr-2 md:mr-0 md:mt-0 z-10">
                     <Image
                       src="https://picsum.photos/seed/doctor/200"
                       alt="Doctor Illustration"
                       fill // Use fill instead of layout="fill"
                       style={{ objectFit: "contain" }} // Use style prop for objectFit
                       className="drop-shadow-lg"
                     />
                 </div>

                 <div className="flex items-center space-x-1 md:space-x-2 md:pl-4 md:border-l border-primary-foreground/20 md:ml-4">
                     <LanguageToggle currentLocale={params.locale} /> {/* Pass current locale */}
                     <ThemeToggle />
                 </div>

                  {/* Mobile Menu Trigger */}
                  <div className="md:hidden">
                     <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                     </Button>
                  </div>
              </div>
          </div>
      </nav>

      {/* Hero Section */}
       <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center bg-gradient-to-br from-primary/90 via-primary/70 to-secondary/60 dark:from-primary/70 dark:via-primary/50 dark:to-secondary/40 text-primary-foreground px-4 overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('/hero-background.svg')] bg-cover bg-center"></div>
         <div className="relative z-10 max-w-4xl mx-auto">
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">Understand Your Skin Better with AI</h1>
           <p className="text-lg md:text-xl lg:text-2xl mb-8 opacity-90 drop-shadow-md max-w-2xl mx-auto">Get a preliminary analysis by answering questions or uploading an image.</p>
           <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <QuestionnaireModal onSave={handleQuestionnaireSubmit}>
                 <Button size="lg" variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-3 text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                    <ListChecks className="mr-2 h-5 w-5"/>
                    Assess Your Skin
                 </Button>
              </QuestionnaireModal>
             <Button size="lg" variant="outline" onClick={scrollToUpload} className="bg-white/90 text-primary border-primary/30 hover:bg-white hover:border-primary/50 rounded-full px-8 py-3 text-lg shadow-lg transition-all duration-300 transform hover:scale-105">
                <Upload className="mr-2 h-5 w-5"/>
                Upload Image
             </Button>
           </div>
         </div>
       </section>

       {/* Scrolling Disease List */}
       <ScrollingDiseaseList />

      {/* Conditions Section - Updated Card Styles */}
      <section id="conditions" className="container mx-auto py-16 px-4">
        <Card className="bg-card rounded-lg p-6 md:p-10"> {/* Wrap section content in Card */}
          <CardHeader className="text-center mb-8">
            <h2 className="text-3xl font-semibold mb-2">Common Conditions We Analyze</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Our AI provides preliminary insights based on the HAM10000 dataset and common conditions. <Link href={`/${params.locale}/skin-info`} className="text-primary hover:underline">Learn more</Link>.</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {skinConditions.slice(0, 6).map((condition, index) => (
                 <Card key={condition.name} className="condition-card group"> {/* Added group class here */}
                    <div>
                        <CardTitle className="text-xl mb-2 font-semibold text-card-foreground">{condition.name}</CardTitle>
                        <CardDescription className="text-sm leading-relaxed text-card-foreground/80 mb-4">{condition.description}</CardDescription>
                    </div>
                    <div className="flex items-end justify-between mt-4">
                        <div className="text-current opacity-70 group-hover:opacity-90 transition-opacity">
                            {condition.icon}
                        </div>
                         <Link href={`/${params.locale}/skin-info`} className="condition-arrow"> {/* Use CSS class */}
                             <ChevronRight className="h-5 w-5" />
                         </Link>
                         {/* Hover content using CSS class */}
                         <div className="condition-hover-content">
                           <p className="condition-hover-text">Click arrow for more details...</p>
                         </div>
                    </div>
                 </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Upload & Analysis Section */}
       <section id="upload" ref={uploadSectionRef} className="container mx-auto py-16 px-4">
         <Card className="bg-card rounded-lg p-6 md:p-10"> {/* Wrap section content in Card */}
            <CardHeader className="text-center mb-8">
                <h2 className="text-3xl font-semibold mb-2">Analyze Your Skin</h2>
                <p className="text-muted-foreground">Upload an image or provide details via assessment.</p>
            </CardHeader>
            <CardContent className="max-w-2xl mx-auto">
               <div className="mb-6">
                    <ImageUpload onImageUpload={handleFileSelect} loading={loading} currentImagePreview={imagePreview} />
               </div>

                {questionnaireData && (
                     <Card className="mb-6 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800">
                        <CardHeader className="p-3">
                             <CardTitle className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2"><ListChecks className="h-4 w-4"/> Assessment Summary Provided</CardTitle>
                         </CardHeader>
                        <CardContent className="p-3 pt-0">
                             <p className="text-xs text-blue-700 dark:text-blue-400">Age: {questionnaireData.age ?? 'N/A'} | Gender: {questionnaireData.gender ?? 'N/A'} | Symptom: {questionnaireData.symptoms ?? 'N/A'}</p>
                         </CardContent>
                     </Card>
                 )}


                <Button onClick={handleAnalysis} disabled={loading || (!selectedFile && !questionnaireData)} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mb-6 text-lg py-3">
                    {loading ? ( // Show loading indicator *during* API call
                        <>
                            <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                            Analyzing...
                        </>
                     ) : (
                        'Analyze Now'
                     )}
                </Button>
            </CardContent>
         </Card>
      </section>


      {/* Past Reports Section */}
       <PastReportsSection reports={pastReports} onViewPdf={handleViewPastReportPdf} onDownloadPdf={handleDownloadPastReportPdf} />


      {/* Educational Section */}
       <section className="w-full bg-secondary dark:bg-secondary/50 py-16">
         <div className="container mx-auto px-4 text-center">
             <h2 className="text-3xl font-semibold mb-4">Why Use SkinSewa AI?</h2>
             <p className="text-muted-foreground max-w-3xl mx-auto mb-10">Gain preliminary insights and awareness about potential skin conditions. Remember to consult a professional.</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Card className="bg-card shadow-md text-left p-6 rounded-lg">
                  <CardTitle className="flex items-center gap-2 text-lg mb-2"><Info className="h-5 w-5 text-primary"/> Early Awareness</CardTitle>
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
            &copy; {new Date().getFullYear()} SkinSewa. All Rights Reserved. <br/>
            <span className="text-destructive font-semibold">Disclaimer: This tool is for informational purposes only and does not provide medical advice.</span>
          </div>
          <div className="flex space-x-4">
            <Link href={`/${params.locale}/privacy`} className="hover:text-primary text-xs">Privacy Policy</Link>
            <Link href={`/${params.locale}/terms`} className="hover:text-primary text-xs">Terms of Service</Link>
            <Link href="mailto:support@skinseva.com" className="hover:text-primary text-xs">Contact Us</Link>
          </div>
        </div>
      </footer>

       <Chatbot />

       <ClinicResultsModal
          isOpen={isClinicModalOpen}
          onClose={() => setIsClinicModalOpen(false)}
          clinics={clinicData}
          loading={clinicLoading}
          error={clinicError}
        />

       {/* Analysis Results Popup */}
        <ResultsPopupModal
            isOpen={isResultsPopupOpen}
            onClose={() => setIsResultsPopupOpen(false)}
            result={result}
            questionnaireData={questionnaireData}
            imageUri={imagePreview} // Pass the image data URI
            loading={loading} // Pass loading state
            apiError={apiError} // Pass error state
            onFindClinics={handleFindClinics} // Pass clinic search trigger
             // Pass handlers for PDF actions
            onViewPdf={async () => {
                 if (!result || !imagePreview) {
                     toast({ variant: "destructive", title: "PDF Error", description: "Missing data to generate PDF." });
                     return;
                 }
                 // Find the corresponding past report using the timestamp added during analysis
                 const reportToUse = pastReports.find(r => r.timestamp === (result as any).timestamp);
                  console.log("Viewing PDF, found report:", reportToUse?.id, "URI:", reportToUse?.pdfDataUri);
                 if (reportToUse?.pdfDataUri) {
                     try {
                         viewPdf(reportToUse.pdfDataUri);
                     } catch (e) {
                         console.error("Error viewing existing PDF:", e);
                         toast({ variant: "destructive", title: "PDF Error", description: "Could not display the existing PDF." });
                     }
                 } else {
                    // Fallback: Generate and view if not found or URI missing (should be rare now)
                    console.warn("PDF URI missing in past report, generating on the fly for view.");
                    try {
                        const newDoc = generatePdfReport(result, questionnaireData, imagePreview);
                        viewPdf(newDoc);
                        // Optionally update the state, though this might be redundant if saving works correctly
                         // setPastReports(prev => prev.map(p => p.id === reportToUse?.id ? { ...p, pdfDataUri: newDoc.output('datauristring') } : p));
                    } catch (genError) {
                        console.error("Error generating PDF for view:", genError);
                        toast({ variant: "destructive", title: "PDF Generation Error", description: "Could not generate the PDF for viewing." });
                    }
                 }
             }}
             onDownloadPdf={async () => {
                if (!result || !imagePreview) {
                    toast({ variant: "destructive", title: "PDF Error", description: "Missing data to generate PDF." });
                    return;
                }
                 // Find the corresponding past report
                 const reportToUse = pastReports.find(r => r.timestamp === (result as any).timestamp);
                  console.log("Downloading PDF, found report:", reportToUse?.id, "URI:", reportToUse?.pdfDataUri);
                  if (reportToUse?.pdfDataUri) {
                     try {
                         downloadPdf(reportToUse.pdfDataUri, `SkinSewa_Report_${format(new Date(reportToUse.timestamp), 'yyyy-MM-dd_HHmm')}.pdf`);
                     } catch (e) {
                        console.error("Error downloading existing PDF:", e);
                        toast({ variant: "destructive", title: "Download Failed", description: "Could not download the existing PDF report." });
                     }
                  } else {
                     // Fallback: Generate and download if not found or URI missing
                      console.warn("PDF URI missing in past report, generating on the fly for download.");
                     try {
                         const newDoc = generatePdfReport(result, questionnaireData, imagePreview);
                         const pdfUri = newDoc.output('datauristring');
                          downloadPdf(pdfUri, `SkinSewa_Report_${format(new Date((result as any).timestamp || Date.now()), 'yyyy-MM-dd_HHmm')}.pdf`);
                          // Optionally update the state
                          // setPastReports(prev => prev.map(p => p.id === reportToUse?.id ? { ...p, pdfDataUri: pdfUri } : p));
                     } catch (genError) {
                        console.error("Error generating PDF for download:", genError);
                        toast({ variant: "destructive", title: "PDF Generation Error", description: "Could not generate the PDF for download." });
                     }
                  }
             }}
        />
    </div>
  );
}

    