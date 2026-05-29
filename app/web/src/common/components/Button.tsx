interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'green' | 'cyan' | 'solid-green' | 'solid-cyan' | 'amber' | 'purge';
  size?: 'md' | 'lg';
  block?: boolean;
}

export default function Button({
  variant = 'default',
  size = 'md',
  block = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'btn',
    variant !== 'default' ? variant : '',
    size === 'lg' ? 'lg' : '',
    block ? 'block' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
