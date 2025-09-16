import Image from "next/image";

interface CostPilotLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function CostPilotLogo({ className = "", width = 120, height = 40 }: CostPilotLogoProps) {
  return (
    <Image
      src="/images/costpilot-logo.svg"
      alt="CostPilot"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}