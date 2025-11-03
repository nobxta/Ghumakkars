// Example usage of the enhanced mobile destinations swiper
import React from 'react';
import MobileDestinationsSwiper from '../components/MobileDestinationsSwiper';

const DestinationsPage = () => {
  // Sample destinations data
  const destinations = [
    {
      id: 1,
      title: "Manali",
      description: "Adventure Paradise",
      image: "https://www.tripstorz.com/_astro/houses-surrounded-by-green-trees-in-manali-during-daytime.DAktkgeM_90jep.jpg"
    },
    {
      id: 2,
      title: "Dalhousie",
      description: "Colonial Hill Station",
      image: "https://s7ap1.scene7.com/is/image/incredibleindia/dalhousie-himachal-pradesh-1-city-hero?qlt=82&ts=1751539687562"
    },
    {
      id: 3,
      title: "Tungnath",
      description: "Highest Shiva Temple",
      image: "https://static.tnn.in/thumb/msid-108203577,thumbsize-65312,width-1280,height-720,resizemode-75/108203577.jpg"
    },
    {
      id: 4,
      title: "Mussoorie",
      description: "Queen of the Hills",
      image: "https://c.ndtvimg.com/gws/ms/top-places-to-visit-in-mussoorie/assets/2.jpeg?1727874795"
    },
    {
      id: 5,
      title: "Rishikesh",
      description: "Yoga Capital of the World",
      image: "https://rishikeshdaytour.com/blog/wp-content/uploads/2019/03/Rishikesh-Uttarakhand-India.jpg"
    },
    {
      id: 6,
      title: "Nainital",
      description: "The Lake District of India",
      image: "https://media1.thrillophilia.com/filestore/k6501j0dj5447unvzmqwso6b3chk_shutterstock_1250724667.jpg?w=400&dpr=2"
    },
    {
      id: 7,
      title: "Spiti",
      description: "Cold Desert Valley",
      image: "https://skyhike.in/uploads/itinerary/xr9b2bLN5tamHrRxzQX5cQ2cuVdY8NP5bOO7BJeY.jpg"
    },
    {
      id: 8,
      title: "Haridwar",
      description: "Gateway to the Gods",
      image: "https://ticketandtime.com/wp-content/uploads/2024/12/Ganga-aarti-haridwar.jpg"
    }
  ];

  return (
    <div className="destinations-page">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Amazing Destinations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover breathtaking places with our carefully curated travel experiences
          </p>
        </div>
        
        {/* Enhanced Mobile Swiper */}
        <MobileDestinationsSwiper destinations={destinations} />
        
        {/* Additional content */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Ready for Your Next Adventure?
          </h2>
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Browse All Trips
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationsPage;
