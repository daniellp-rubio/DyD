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
    <div className={className}>
      <div className="grid grid-cols-6 gap-3">
        {/* Miniaturas a la izquierda */}
        <div className="h-[550px] w-full col-span-1">
          <Swiper
            onSwiper={setThumbsSwiper}
            direction="vertical"
            spaceBetween={12}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Thumbs]}
          >
            {images.map((image, index) => (
              <SwiperSlide key={`thumb-${index}`} className="!h-[125px]">
                <div className="relative w-full h-full border-gray-700 rounded-lg overflow-hidden cursor-pointer transition-colors bg-white">
                  <Image
                    src={`${image}`}
                    alt={`${title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover p-0.5 rounded-lg"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Imagen principal a la derecha */}
        <div className="col-span-5 h-[300px] sm:h-[450px] lg:h-[550px] 3xl:h-[600px]">
          <Swiper
            style={{
              '--swiper-navigation-color': '#fff',
              '--swiper-pagination-color': '#fff',
              height: '100%',
              width: '100%',
            } as React.CSSProperties}
            navigation={true}
            autoplay={{
              delay: 2500
            }}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            modules={[FreeMode, Navigation, Thumbs, Autoplay]}
            className="rounded-lg"
          >
            {images.map((image, index) => (
              <SwiperSlide key={`main-${index}`}>
                <div className="relative w-full h-[300px] sm:h-[450px] lg:h-[550px] 3xl:h-[600px] bg-white rounded-lg overflow-hidden">
                  <Image
                    src={`${image}`}
                    alt={`${title} ${index + 1}`}
                    fill
                    priority={index === 0}
                    className="object-cover rounded-lg"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
};