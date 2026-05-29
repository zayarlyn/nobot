type StatusVariant = 'survivor' | 'flagged' | 'assimilated' | 'verified';
type FlairVariant  = 'HUMAN' | 'BOT' | 'META' | 'STRATEGY' | 'GLITCH';

interface BadgeProps {
  variant: StatusVariant | FlairVariant;
  label?: string;
}

const FLAIR_CLASS: Record<FlairVariant, string> = {
  HUMAN:    'flair-human',
  BOT:      'flair-bot',
  META:     'flair-meta',
  STRATEGY: 'flair-strategy',
  GLITCH:   'flair-glitch',
};

const FLAIR_LABEL: Record<FlairVariant, string> = {
  HUMAN:    'Human Sighting',
  BOT:      'Bot Alert',
  META:     'Meta',
  STRATEGY: 'Strategy',
  GLITCH:   'Glitch',
};

const FLAIR_VARIANTS = new Set<string>(Object.keys(FLAIR_CLASS));

export default function Badge({ variant, label }: BadgeProps) {
  const isFlair = FLAIR_VARIANTS.has(variant);
  const cls = isFlair ? FLAIR_CLASS[variant as FlairVariant] : variant;
  const text = label ?? (isFlair ? FLAIR_LABEL[variant as FlairVariant] : variant);

  return <span className={`badge ${cls}`}>{text}</span>;
}
