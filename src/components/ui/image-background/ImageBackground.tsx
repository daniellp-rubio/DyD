import Image from "next/image";

interface Props {
  src: string;
  alt: string;
};

export const ImageBackground = ({ src, alt }: Props) => {
  return (
    <div className="w-full h-50 relative">
      <Image
        src={src}
        alt={alt}
        layout="fill"
        objectFit="cover"
        priority
      />
    </div>
  );
};
