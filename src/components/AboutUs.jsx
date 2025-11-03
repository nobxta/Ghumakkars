import { useEffect } from 'react';

const AboutUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">About Us</h1>
          <p className="text-slate-500 mb-8">Your trusted travel companion for unforgettable journeys</p>

          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Our Story</h2>
              <p className="text-slate-700">
                Ghumakkars was born from a passion for travel and a desire to make exploring India's beautiful destinations accessible to everyone. 
                We believe that travel is not just about reaching a destination, but about the journey, the experiences, and the memories created along the way.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Our Mission</h2>
              <p className="text-slate-700">
                To provide safe, affordable, and memorable travel experiences that connect people with India's rich culture, breathtaking landscapes, 
                and diverse heritage. We strive to make travel planning simple, booking easy, and experiences unforgettable.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">What We Offer</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li>Curated trips to the most beautiful destinations across India</li>
                <li>Safe and comfortable transportation arrangements</li>
                <li>Quality accommodations that fit your budget</li>
                <li>Well-planned itineraries that maximize your travel experience</li>
                <li>Transparent pricing with no hidden costs</li>
                <li>24/7 customer support throughout your journey</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Why Choose Ghumakkars?</h2>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Trusted Experience:</strong> Years of expertise in organizing memorable trips</li>
                <li><strong>Safety First:</strong> Your safety and comfort are our top priorities</li>
                <li><strong>Flexible Options:</strong> Choose from a variety of trips that suit your schedule and budget</li>
                <li><strong>Community:</strong> Join a community of passionate travelers</li>
                <li><strong>Transparency:</strong> Clear pricing and honest communication at every step</li>
                <li><strong>Customer Care:</strong> Dedicated support team to assist you before, during, and after your trip</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Our Values</h2>
              <p className="text-slate-700 mb-2">
                At Ghumakkars, we are guided by core values that shape everything we do:
              </p>
              <ul className="list-disc pl-6 text-slate-700 space-y-1">
                <li><strong>Integrity:</strong> We conduct our business with honesty and transparency</li>
                <li><strong>Passion:</strong> We are passionate about travel and creating amazing experiences</li>
                <li><strong>Responsibility:</strong> We are committed to responsible and sustainable travel</li>
                <li><strong>Innovation:</strong> We continuously improve our services using technology and feedback</li>
                <li><strong>Respect:</strong> We respect our customers, partners, and the destinations we visit</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Contact Us</h2>
              <p className="text-slate-700">
                Have questions or want to learn more? We'd love to hear from you!
              </p>
              <ul className="list-disc pl-6 text-slate-700 mt-2">
                <li>Email: <a href="mailto:contact@ghumakkars.in" className="text-blue-600 underline">contact@ghumakkars.in</a></li>
                <li>Phone: <a href="tel:+918384826414" className="text-blue-600 underline">+91 8384826414</a></li>
                <li>WhatsApp: <a href="https://wa.me/918384826414" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Click Here</a></li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Join Us</h2>
              <p className="text-slate-700">
                Ready to start your next adventure? Explore our trips, book your journey, and become a part of the Ghumakkars family. 
                We're excited to help you create memories that will last a lifetime!
              </p>
            </div>
          </section>

          <div className="mt-10 text-sm text-slate-500">© 2025 Ghumakkars | All Rights Reserved</div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

