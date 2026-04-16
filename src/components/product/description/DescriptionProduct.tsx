'use client';

import { MouseEvent, useRef, useState } from "react";

// Components
import { ZoomImage } from "@/components/images/ZoomImage";

interface Props {
  title: string;
  descriptionImages: Array<string>;
  className?: string;
};

export const DescriptionProduct = ({ title, descriptionImages = [], className }: Props) => {
  return (
    <div className={className}>
      {descriptionImages?.map((image) => (
        <ZoomImage key={image} src={image} alt={title} width={1800} height={800} className="mr-5" />
      ))}
    </div>
  );
};
