import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="dark min-h-screen bg-black relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 py-8 flex flex-col min-h-screen">
        <header className="py-6">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 bg-clip-text text-transparent"
            >
              SPEND IQ
            </Link>
            <Link href="/" className="text-zinc-300 hover:text-white transition-colors">
              Back to Home
            </Link>
          </div>
        </header>

        <main className="flex-1 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Privacy Policy</h1>

            <div className="prose prose-invert max-w-none">
              <p className="text-zinc-300 mb-4">
                At SPEND IQ, we take your privacy seriously. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you use our expense
                tracking service.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                Open Source and Hosting Options
              </h2>
              <p className="text-zinc-300 mb-4">
                SPEND IQ is an open source project available in two forms:
              </p>
              <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-4">
                <li>
                  <strong>Self-hosted version:</strong> If you choose to self-host SPEND IQ, you
                  maintain complete control over your data. In this case, we do not collect or have
                  access to any of your information. This privacy policy applies only to the data
                  collection practices of our official hosted service.
                </li>
                <li>
                  <strong>Hosted service:</strong> If you use our hosted service for a monthly fee,
                  this privacy policy describes how we handle your data.
                </li>
              </ul>
              <p className="text-zinc-300 mb-4">
                The remainder of this privacy policy applies to users of our hosted service.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                1. Information We Collect
              </h2>
              <p className="text-zinc-300 mb-4">
                We collect several types of information from and about users of our service,
                including:
              </p>
              <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-4">
                <li>Personal information (name, email address, contact information)</li>
                <li>Account credentials (for our service only, not your bank credentials)</li>
                <li>
                  Financial information (transaction data, account balances, spending categories)
                </li>
                <li>Usage data (how you interact with our service)</li>
                <li>Device information (browser type, IP address, device identifiers)</li>
              </ul>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                2. How We Collect Information
              </h2>
              <p className="text-zinc-300 mb-4">
                We collect information directly from you when you:
              </p>
              <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-4">
                <li>Register for our service</li>
                <li>Connect your bank accounts</li>
                <li>Interact with our service</li>
                <li>Communicate with us</li>
              </ul>
              <p className="text-zinc-300 mb-4">
                We also collect information through automated technologies such as cookies and
                similar tracking technologies.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-zinc-300 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-4">
                <li>Provide and maintain our service</li>
                <li>Process and categorize your financial transactions</li>
                <li>Provide personalized spending insights and recommendations</li>
                <li>Send notifications about your budgets and spending</li>
                <li>Improve and enhance our service</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Detect, prevent, and address technical issues or fraudulent activities</li>
              </ul>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                4. Disclosure of Your Information
              </h2>
              <p className="text-zinc-300 mb-4">We may disclose your information to:</p>
              <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-4">
                <li>Service providers that assist us in providing our service</li>
                <li>Business partners with your consent</li>
                <li>Legal authorities when required by law or to protect our rights</li>
              </ul>
              <p className="text-zinc-300 mb-4">
                We do not sell your personal information to third parties.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">5. Data Security</h2>
              <p className="text-zinc-300 mb-4">
                We implement appropriate technical and organizational measures to protect your
                information. However, no method of transmission over the Internet or electronic
                storage is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">6. Your Privacy Rights</h2>
              <p className="text-zinc-300 mb-4">
                Depending on your location, you may have certain rights regarding your personal
                information, such as:
              </p>
              <ul className="list-disc pl-6 text-zinc-300 space-y-2 mb-4">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your information</li>
                <li>Restriction or objection to processing</li>
                <li>Data portability</li>
              </ul>
              <p className="text-zinc-300 mb-4">
                To exercise these rights, please contact us using the information provided below.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">
                7. Changes to Our Privacy Policy
              </h2>
              <p className="text-zinc-300 mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any
                changes by posting the new Privacy Policy on this page and updating the "Last
                Updated" date.
              </p>

              <h2 className="text-xl font-semibold text-white mt-8 mb-4">8. Contact Information</h2>
              <p className="text-zinc-300 mb-4">
                If you have any questions about this Privacy Policy, please contact us at
                privacy@spendiq.com.
              </p>
            </div>

            <p className="text-zinc-400 mt-12 text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </main>

        <footer className="text-center text-zinc-500 text-sm py-8">
          <div className="flex justify-center space-x-4">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
          </div>
          <p className="mt-2">© {new Date().getFullYear()} SPEND IQ. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
