'use client';
import Image from "next/image";

// Components
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Pagination } from "swiper/modules";

// Styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

import './slideshow.css';

interface Props {
  images: string[];
  title: string;
  className?: string;
};

export const ProductMobileSlideshow = ({ images, title, className }: Props) => {
  return (
    <div className={className}>
      <Swiper
        style={{
          width: "100vw",
          height: "500px",
        }}
        pagination
        autoplay={{
          delay: 2500
        }}
        modules={[FreeMode, Autoplay, Pagination]}
        className="mySwiper2"
      >
        {
          images.map((image, index) => (
            <SwiperSlide key={index}>
              <Image
                width={2000}
                height={2000}
                src={`${image}`}
                alt={title}
                className="object-fill"
              />
            </SwiperSlide>
          ))
        }
      </Swiper>
    </div>
  );
};
