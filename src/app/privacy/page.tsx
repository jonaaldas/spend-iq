import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 py-8 flex flex-col min-h-screen">
        <header className="py-6">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 bg-clip-text text-transparent"
            >
              SPEND IQ
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to Home
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>

            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p className="text-muted-foreground mb-4">
                At SPEND IQ, we take your privacy seriously. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you use our expense
                tracking service. Please read this policy carefully. If you disagree with its terms,
                please discontinue use of our service.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-4">
                We collect information that you provide directly to us when you:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Create an account</li>
                <li>Connect your bank accounts or financial institutions</li>
                <li>Manually enter transaction data</li>
                <li>Use our budgeting features</li>
                <li>Contact customer support</li>
                <li>Respond to surveys or promotions</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">3. Types of Data We Collect</h2>
              <p className="text-muted-foreground mb-4">This may include:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Personal identifiers (name, email address)</li>
                <li>Authentication information for bank accounts</li>
                <li>
                  Financial information (transaction history, account balances, recurring expenses)
                </li>
                <li>Device information and usage data</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">
                4. Open Source Project Data Handling
              </h2>
              <p className="text-muted-foreground mb-4">
                SPEND IQ is available as both a self-hosted open source project and a hosted
                service:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>
                  <strong>Self-hosted version:</strong> If you use the self-hosted version, your
                  data remains on your servers. We do not have access to or collect any of your data
                  in this scenario. You are responsible for securing your own data and ensuring
                  compliance with applicable laws.
                </li>
                <li>
                  <strong>Hosted service:</strong> If you use our hosted service, this Privacy
                  Policy applies in full to our collection and processing of your data.
                </li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">5. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process and categorize financial transactions</li>
                <li>Generate insights about your spending habits</li>
                <li>Send notifications about budget alerts</li>
                <li>Respond to your comments and questions</li>
                <li>Understand how users interact with our service</li>
                <li>
                  Detect, investigate, and prevent fraudulent transactions and other illegal
                  activities
                </li>
                <li>Protect the rights and property of SPEND IQ and others</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Security</h2>
              <p className="text-muted-foreground mb-4">
                We implement appropriate technical and organizational measures to protect your
                personal information. However, no method of transmission over the Internet or
                electronic storage is 100% secure. While we strive to use commercially acceptable
                means to protect your personal information, we cannot guarantee its absolute
                security.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">7. Third-Party Services</h2>
              <p className="text-muted-foreground mb-4">
                Our service may use third-party services for bank connections, data processing, and
                analytics. These third parties have access to your personal information only to
                perform specific tasks on our behalf and are obligated not to disclose or use it for
                any other purpose.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">8. Your Rights and Choices</h2>
              <p className="text-muted-foreground mb-4">
                Depending on your location, you may have certain rights regarding your personal
                information, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Accessing your personal information</li>
                <li>Correcting inaccurate information</li>
                <li>Deleting your personal information</li>
                <li>Restricting or objecting to processing</li>
                <li>Data portability</li>
                <li>Withdrawing consent</li>
              </ul>

              <h2 className="text-xl font-semibold mt-8 mb-4">9. Updates to This Policy</h2>
              <p className="text-muted-foreground mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the &quot;Last
                updated&quot; date.
              </p>

              <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this Privacy Policy, please contact us at:
                privacy@spendiq.com
              </p>
            </div>

            <p className="text-muted-foreground mt-12 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </main>

        <footer className="text-center text-muted-foreground text-sm py-8">
          <div className="flex justify-center space-x-4">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </div>
          <p className="mt-2">© {new Date().getFullYear()} SPEND IQ. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
