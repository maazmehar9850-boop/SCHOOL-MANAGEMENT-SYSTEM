import { FileDown } from "lucide-react";
import GradientButton from "./GradientButton";

function SaveAsPdfButton({
  onClick,
  children = "Save as PDF",
  variant = "secondary",
  className = "",
  ...props
}) {
  return (
    <GradientButton
      type="button"
      variant={variant}
      className={className}
      onClick={onClick}
      {...props}
    >
      <FileDown size={16} />
      {children}
    </GradientButton>
  );
}

export default SaveAsPdfButton;
