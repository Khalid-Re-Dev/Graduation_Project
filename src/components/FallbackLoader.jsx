import { Loader2 } from "lucide-react";

/**
 * Fallback loader component to display while content is loading
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display
 * @param {boolean} props.fullPage - Whether to display as a full page loader
 * @param {string} props.className - Additional CSS classes
 */
function FallbackLoader({ message = "Loading content...", fullPage = false, className = "" }) {
  const baseClasses = "flex flex-col items-center justify-center p-8 text-center";
  const fullPageClasses = fullPage ? "min-h-[70vh]" : "";
  const combinedClasses = `${baseClasses} ${fullPageClasses} ${className}`;

  return (
    <div className={combinedClasses}>
      <Loader2 className="w-12 h-12 text-[#005580] animate-spin mb-4" />
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

export default FallbackLoader;
