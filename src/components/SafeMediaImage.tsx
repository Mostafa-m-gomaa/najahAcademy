import { useState, type ImgHTMLAttributes } from "react";
import { resolveMediaUrl } from "@/lib/api";

type SafeMediaImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  wrapperClassName?: string;
};

const SafeMediaImage = ({
  src,
  alt = "",
  className,
  wrapperClassName,
  onError,
  ...rest
}: SafeMediaImageProps) => {
  const [failed, setFailed] = useState(false);
  const url = resolveMediaUrl(src);

  if (!url || failed) return null;

  const image = (
    <img
      src={url}
      alt={alt}
      className={className}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
      {...rest}
    />
  );

  if (wrapperClassName) {
    return <div className={wrapperClassName}>{image}</div>;
  }

  return image;
};

export default SafeMediaImage;
