import { useEffect } from 'react';

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500 mb-8">Effective Date: March 15, 2025</p>

          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">1. Introduction</h2>
              <p className="text-slate-700">We value your privacy and are committed to protecting your information. This policy explains how we collect, use, and safeguard your data when you use our services, including communication via WhatsApp or other channels.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">2. Information We Collect</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Your name and phone number.</li>
                <li>Any personal information you provide regarding travel arrangements.</li>
                <li>Your trip preferences such as destinations, dates, and accommodations.</li>
                <li>Messages, emails, or feedback submitted to us.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Respond to inquiries and provide customer support.</li>
                <li>Coordinate trip details, bookings, and reservations.</li>
                <li>Send important travel updates and safety information.</li>
                <li>Improve our services and user experience.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">4. How We Share Your Information</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>When required by law or governmental authorities.</li>
                <li>With hotels, transport agencies, or partners as needed to fulfill bookings.</li>
                <li>To protect our legal rights, business interests, or enforce policies.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">5. Security of Your Data</h2>
              <p className="text-slate-700">We take reasonable measures to secure your information. However, no method of transmission over the internet is entirely secure; you accept the inherent risks.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">6. WhatsApp and Third-Party Communications</h2>
              <p className="text-slate-700">If you contact us via WhatsApp, your use of that platform is governed by WhatsApp’s own Privacy Policy. We do not control how third-party services handle your data.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">7. Your Rights</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Request access to your personal information.</li>
                <li>Request corrections to inaccurate information.</li>
                <li>Request deletion of your data unless retention is legally required.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">8. Updates to This Privacy Policy</h2>
              <p className="text-slate-700">We may update this policy periodically. Changes are effective upon posting. Please review this page occasionally for updates.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">9. Contact Us</h2>
              <p className="text-slate-700">If you have questions or requests related to privacy and data protection, contact us:</p>
              <ul className="list-disc pl-6 text-slate-700 mt-2">
                <li>WhatsApp: <a href="#" className="text-blue-600 underline">Click Here</a></li>
                <li>Email: <a href="mailto:yashankgla05@email.com" className="text-blue-600 underline">yashankgla05@email.com</a></li>
              </ul>
            </div>

          </section>

          <div className="mt-10 text-sm text-slate-500">© 2025 Ghumakkars | All Rights Reserved</div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;


