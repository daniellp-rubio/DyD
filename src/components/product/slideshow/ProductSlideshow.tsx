'use client';
import Image from "next/image";
import { useState } from "react";

// Components
import { Swiper as SwiperObject } from 'swiper';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode, Navigation, Thumbs } from "swiper/modules";

// Styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

import './slideshow.css';

interface Props {
  images: string[];
  title: string;
  className?: string;
};

export const ProductSlideshow = ({ images, title, className }: Props) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperObject>();

  return (
    <div className={className} aria-label={`Galería de imágenes de ${title}`}>
      <Swiper
        style={{
          '--swiper-navigation-color': '#fff',
          '--swiper-pagination-color': '#fff',
        } as React.CSSProperties}
        spaceBetween={10}
        navigation={true}
        autoplay={{
          delay: 2500
        }}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[FreeMode, Navigation, Thumbs, Autoplay]}
        className="mySwiper2"
      >
        {
          images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="overflow-hidden rounded-lg group">
                <Image
                  width={1024}
                  height={800}
                  src={`${image}`}
                  alt={`${title} - imagen ${index + 1}`}
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="rounded-lg object-cover w-full h-auto transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
                />
              </div>
            </SwiperSlide>
          ))
        }
      </Swiper>

      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={4}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper"
      >
        {
          images.map((image, index) => (
            <SwiperSlide key={index}>
              <Image
                width={300}
                height={300}
                src={`${image}`}
                alt={`${title} - miniatura ${index + 1}`}
                sizes="(max-width: 768px) 25vw, 150px"
                className="rounded-lg object-cover"
              />
            </SwiperSlide>
          ))
        }
      </Swiper>
    </div>
  );
};