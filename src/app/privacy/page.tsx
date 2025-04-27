
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse } from "lucide-react";


export default function PrivacyPolicyPage() {
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
                     <Button variant="ghost" asChild>
                         <Link href="/awareness" className="text-sm">Skin Conditions</Link>
                     </Button>
                </div>
            </div>
        </nav>

      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
            <p>
              Welcome to SkinDeep AI. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
             <p className="mb-2">We may collect information about you in a variety of ways. The information we may collect via the Application includes:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Image Data:</strong> Images you upload for analysis. These images are processed to provide the service and may be temporarily stored for analysis purposes. We aim to anonymize or de-identify images where possible if retained for model improvement.
              </li>
              <li>
                <strong>Questionnaire Data:</strong> Information you voluntarily provide through the skin assessment questionnaire, such as age, gender, symptoms, etc.
              </li>
               <li>
                <strong>Usage Data:</strong> Information automatically collected when you access the Application, such as your IP address, browser type, operating system, access times, and the pages you have viewed directly before and after accessing the Application. (Specify if you collect this)
              </li>
            </ul>
          </section>

           <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Use of Your Information</h2>
             <p className="mb-2">Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Provide the core functionality of the skin analysis service.</li>
                <li>Improve our AI models and application performance (using anonymized or aggregated data where feasible).</li>
                <li>Respond to user inquiries and support requests.</li>
                <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
                <li>Comply with legal obligations.</li>
             </ul>
          </section>

            <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Disclosure of Your Information</h2>
             <p className="mb-2">We do not share your personal information or uploaded images with third parties except in the following situations:</p>
             <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>With Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf and require access to such information to do that work (e.g., cloud hosting, AI model providers).</li>
                <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                 <li><strong>Aggregated Data:</strong> We may share aggregated, anonymized data that does not directly identify you for research or model improvement purposes.</li>
             </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information and image data. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </section>

           <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Data Retention</h2>
            <p>
                We will retain uploaded images and associated analysis results only as long as necessary to provide the service and for legitimate business purposes, such as model improvement (where data is anonymized/aggregated if possible) or as required by law. Questionnaire data will be retained similarly.
            </p>
          </section>

            <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Children's Privacy</h2>
            <p>
                Our service is not intended for individuals under the age of 18 (or the age of majority in their jurisdiction). We do not knowingly collect personal information from children.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
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
