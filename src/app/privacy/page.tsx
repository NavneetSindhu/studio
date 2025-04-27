
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";


export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground">
       {/* Simple Header for this page */}
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

      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="mb-4 text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Introduction</h2>
            <p>
              Welcome to SkinDeep AI ("we," "us," or "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application (the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the Service.
            </p>
          </section>

          <section className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Information We Collect</h2>
             <p className="mb-2">We may collect information about you in a variety of ways. The information we may collect via the Service includes:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-foreground/90">
              <li>
                <strong>Image Data:</strong> Images of your skin that you voluntarily upload for analysis. These images are processed by our AI model to provide the Service. We strive to process images transiently and avoid long-term storage where possible. If images are retained for model improvement, we aim to anonymize or de-identify them.
              </li>
              <li>
                <strong>Questionnaire Data:</strong> Information you voluntarily provide through the skin assessment questionnaire, such as age, gender, complexion, symptoms, and products used. This data is used to provide context for the AI analysis.
              </li>
               <li>
                <strong>Location Data:</strong> If you use the "Find Nearest Clinic" feature, we will request access to your device's location (latitude and longitude) solely to identify nearby clinics. We do not store your precise location data after the search is performed.
              </li>
               <li>
                <strong>Usage Data (Optional):</strong> We may collect non-personally identifiable information automatically when you access the Service, such as your device type, operating system, access times, and general interaction patterns to improve the Service. We do not collect IP addresses for tracking purposes unless necessary for security or legal compliance. (Please specify if you *do* collect more detailed usage data).
              </li>
            </ul>
          </section>

           <section className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Use of Your Information</h2>
             <p className="mb-2">Having accurate information permits us to provide you with a smooth, efficient, and potentially more accurate analysis. Specifically, we may use information collected about you via the Service to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-foreground/90">
                <li>Provide the core functionality of the AI skin analysis.</li>
                <li>Use questionnaire data to add context to the image analysis.</li>
                <li>Provide the "Find Nearest Clinic" feature based on your current location (with permission).</li>
                <li>Improve our AI models and application performance (using anonymized or aggregated data where feasible).</li>
                <li>Respond to user inquiries and support requests.</li>
                <li>Monitor and analyze usage and trends (anonymously) to improve your experience.</li>
                <li>Comply with legal obligations.</li>
             </ul>
          </section>

            <section className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Disclosure of Your Information</h2>
             <p className="mb-2">We do not sell or rent your personal information or uploaded images. We may share information we have collected about you in certain situations:</p>
             <ul className="list-disc list-inside space-y-1 ml-4 text-foreground/90">
                <li><strong>With Service Providers:</strong> We may share necessary information with third-party vendors who perform services for us, such as cloud hosting (e.g., Google Cloud, AWS) and AI model processing (e.g., Google AI Platform). These providers are obligated to protect your data.</li>
                 <li><strong>For AI Analysis:</strong> Uploaded images and questionnaire data are sent to our AI service provider (e.g., Google AI) for processing to generate the analysis result.</li>
                <li><strong>By Law or to Protect Rights:</strong> If required by law, subpoena, or other legal process, or if we believe in good faith that disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to a government request.</li>
                 <li><strong>Aggregated/Anonymized Data:</strong> We may share aggregated or anonymized data (which cannot identify you) for research, analysis, or model improvement purposes.</li>
             </ul>
             <p>We will not share your identifiable image or health-related questionnaire data with third parties for their marketing purposes without your explicit consent.</p>
          </section>

          <section className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures designed to help protect your personal information and image data. This includes encryption during transit and at rest where feasible. While we have taken reasonable steps to secure the information you provide, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against interception or misuse. Any information disclosed online is vulnerable to interception and misuse by unauthorized parties.
            </p>
          </section>

           <section className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Data Retention</h2>
            <p>
                We retain uploaded images and associated analysis results only as long as necessary to provide the Service and fulfill the purposes outlined in this policy, unless a longer retention period is required or permitted by law. Questionnaire data is retained similarly. Location data requested for clinic searches is not stored by us. Anonymized or aggregated data may be kept longer for research and development.
            </p>
          </section>

            <section className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Children's Privacy</h2>
            <p>
                Our Service is not intended for individuals under the age of 18 (or the age of majority in their jurisdiction). We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18 without verification of parental consent, we will take steps to remove that information.
            </p>
          </section>

          <section className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last updated" date. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of the Service after the date any such changes become effective constitutes your acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-2xl font-semibold mb-3 border-b pb-2">Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at: <Link href="mailto:privacy@skindeepai.example.com" className="text-primary hover:underline">privacy@skindeepai.example.com</Link>
            </p>
          </section>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="w-full py-8 bg-card text-muted-foreground border-t mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4 text-center md:text-left">
          <div className="text-xs mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} SkinDeep AI. All Rights Reserved.
          </div>
          <div className="flex space-x-4">
            <Link href="/privacy" className="hover:text-primary text-xs font-semibold">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary text-xs">Terms of Service</Link>
            <Link href="mailto:support@skindeepai.example.com" className="hover:text-primary text-xs">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

