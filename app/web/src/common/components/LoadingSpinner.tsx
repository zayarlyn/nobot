interface LoadingSpinnerProps {
  size?: 'sm' | 'lg';
}

export default function LoadingSpinner({ size = 'sm' }: LoadingSpinnerProps) {
  return (
    <div className="spinner-wrap">
      <div className={`spinner ${size === 'lg' ? 'lg' : ''}`} />
    </div>
  );
}
