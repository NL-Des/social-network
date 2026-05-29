interface InputStdProps {
  type: string
  placeholder: string
  name: string
  className?: string
}

export default function InputStd({ type, placeholder, name, className }: InputStdProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      name={name}
      className={`border-1 border-brand-border shadow-neon p-5 rounded-2xl text-brand-text ${className ?? ''}`}
    />
  )
}
