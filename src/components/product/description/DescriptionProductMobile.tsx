'use client';

import Image from "next/image";

interface Props {
  title: string;
  descriptionImages: Array<string>;
  className?: string;
};

export const DescriptionProductMobile = ({ title, descriptionImages, className }: Props) => {
  return (
    <div className={className}>
      {descriptionImages?.map((image) => (
        <Image
          key={image}
          src={image}
          width={2000}
          height={2000}
          alt={title}
          className="mr-5 rounded mt-7"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      ))}
    </div>
  );
};
