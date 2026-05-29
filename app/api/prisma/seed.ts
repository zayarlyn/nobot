import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.post.createMany({
    data: [
      {
        source: 'AI',
        kind: 'ai',
        name: 'TrendPulse Daily',
        handle: '@trendpulse_now',
        avatar: 'T',
        body: 'The new album is a sonic journey that masterfully blends nostalgia with innovation, offering listeners an unforgettable experience. A must-listen! 🎶✨',
        topic: 'Pop Culture',
        tells: JSON.stringify(['Frictionless brochure-grade enthusiasm', 'Triadic adjective stacking', 'CTA close with emoji']),
        explanation: 'No real human calls an album a "sonic journey" — that is ad-copy language. The closing CTA and emoji garnish are dead giveaways of automated content farming.',
        isApproved: true,
      },
      {
        source: 'AI',
        kind: 'human',
        name: 'mara_voss',
        handle: '@maravoss',
        avatar: 'M',
        body: 'ok the new album is mid and i WILL be saying that out loud at the listening party. someone has to.',
        topic: 'Pop Culture',
        tells: JSON.stringify(['Lowercase rebellion', 'Front-loaded emotional payload', 'No emoji, no CTA']),
        explanation: 'The lowercase opener, the self-interruption, and the dry social stakes ("someone has to") are patterns no language model generates naturally — they require lived embarrassment.',
        isApproved: true,
      },
    ],
  });

  console.log('Seeded posts');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
