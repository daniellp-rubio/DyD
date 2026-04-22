// Fonts
import { inter } from "@/config/fonts";

interface Props {
  title: string;
  subtitle?: string;
  className?: string;
};

export const Title = ({title, subtitle, className}: Props) => {
  return (
    <div className={`mt-10 text-white ${className}`}>
      <h1 className={`${inter.className} antialiased text-3xl font-semibold my-2`}>
        { title }
      </h1>

      {
        subtitle && (
          <h3 className="text-lg mb-5">{ subtitle }</h3>
        )
      }
    </div>
  );
};