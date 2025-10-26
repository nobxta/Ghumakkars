import { useEffect } from 'react';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">Terms & Conditions</h1>
          <p className="text-slate-600 mb-8">Please read these terms carefully before joining our trip.</p>

          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">1. Payment Policy</h2>
              <h3 className="font-medium text-slate-700 mb-1">1.1 Trip Fees & Structure</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Seat Lock Fee: Non-refundable amount to confirm your spot.</li>
                <li>Trip Fee: Covers transportation, accommodation, and planned activities.</li>
              </ul>
              <h3 className="font-medium text-slate-700 mt-4 mb-1">1.2 Payment Process</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Pay either the full amount upfront or just the Seat Lock Fee first.</li>
                <li>Your spot is only confirmed after full payment.</li>
              </ul>
              <h3 className="font-medium text-slate-700 mt-4 mb-1">1.3 Refund & Cancellation Policy</h3>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Seat Lock Fee is non-refundable.</li>
                <li>Trip Fee is refundable only if canceled before the refund deadline.</li>
                <li>No refunds for last-minute cancellations or no-shows.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">2. Itinerary & Changes</h2>
              <p className="text-slate-700">The trip plan may change due to unforeseen circumstances. Seasonal variations may affect the destination’s appearance. Activity changes will have alternatives, but no refunds will be issued.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">3. Accommodation & Room Sharing</h2>
              <p className="text-slate-700">Hotel details will be shared before departure. Rooms are shared unless a private room is requested (subject to availability and extra cost).</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">4. Transport & Timing</h2>
              <p className="text-slate-700">Be on time for all departures to avoid missing transport. Delays may occur due to traffic, weather, or other factors.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">5. Food & Dietary Restrictions</h2>
              <p className="text-slate-700">Meals are included based on the trip plan. Dietary preferences will be considered but cannot be guaranteed. Participants with food allergies must check ingredients before consumption.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">6. Rules & Conduct</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Valid government-issued ID is mandatory.</li>
                <li>No alcohol, drugs, or illegal activities allowed.</li>
                <li>Respect fellow travelers and organizers.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">7. Emergencies & Health Precautions</h2>
              <p className="text-slate-700">You are responsible for your own safety and belongings. Carry essential medications and emergency contact information.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">8. Travel Insurance & Personal Risk</h2>
              <p className="text-slate-700">No travel insurance is provided by the organizer. Participants must arrange their own insurance if needed.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">9. Photography & Media Usage</h2>
              <p className="text-slate-700">Photos and videos may be taken during the trip for promotional purposes. If you don’t want to be featured, inform us before the trip starts.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">10. Packing Guidelines & Essentials</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Government ID and student ID (if applicable).</li>
                <li>Appropriate clothing and travel essentials.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">11. Communication & Support</h2>
              <p className="text-slate-700">Trip coordinators will provide communication channels before departure. Emergency contacts will be shared for assistance.</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">12. Agreement to Terms</h2>
              <p className="text-slate-700">By paying the Seat Lock Fee and/or Trip Fee, you confirm that you have read, understood, and agreed to these Terms & Conditions.</p>
            </div>
          </section>

          <div className="mt-10 text-sm text-slate-500">© 2025 Ghumakkars | All Rights Reserved</div>
        </div>
      </div>
    </div>
  );
};

export default Terms;


