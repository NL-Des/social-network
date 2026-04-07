export default function InputStd({type, placeholder, className}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`border-1 border-brand-border shadow-neon p-5 rounded-2xl text-brand-text ${className}`}
    />
  )
}
