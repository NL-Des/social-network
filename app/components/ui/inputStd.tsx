export default function InputStd({type, placeholder, name, className, required=false}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      required={required}
      className={`border-1 border-brand-border shadow-neon p-5 rounded-2xl text-brand-text ${className ?? ''}`}
    />
  )
}
