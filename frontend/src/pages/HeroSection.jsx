import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import heroImage1 from "../assets/hero-1.jpeg";
import heroImage2 from "../assets/hero-2.jpeg";
import heroImage3 from "../assets/hero-3.jpeg";


const heroTexts = [
  "Find the Best Turfs Near You!",
  "Book Your Favorite Turf Instantly!",
  "Play, Compete, and Have Fun!"
];

function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="hero">
      <Swiper
        modules={[EffectFade, Autoplay, Pagination]}
        effect="fade"
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
        pagination={{ clickable: true }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="hero-slider"
      >
        <SwiperSlide>
          <img src={heroImage1} alt="Turf 1" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={heroImage2} alt="Turf 2" />
        </SwiperSlide>
        <SwiperSlide>
          <img src={heroImage3} alt="Turf 3" />
        </SwiperSlide>
      </Swiper>
      
      {/* Dynamic Text */}
      <h1 className="hero-text">{heroTexts[activeIndex]}</h1>
    </div>
  );
}

export default HeroSection;
