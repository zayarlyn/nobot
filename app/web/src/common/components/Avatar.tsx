interface AvatarProps {
  initial: string;
  size?: 'sm' | 'md' | 'lg';
  verified?: boolean;
}

export default function Avatar({ initial, size = 'md', verified = false }: AvatarProps) {
  const classes = ['avatar', size, verified ? 'green' : ''].filter(Boolean).join(' ');
  return <div className={classes}>{initial.toUpperCase()}</div>;
}
