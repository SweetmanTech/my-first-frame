import ArtistTitle from '@/components/ArtistTitle';
import FrameFooter from '@/components/FrameFooter';
import Leaderboard from '@/components/Leaderboard';
import getEthPrice from '@/lib/getEthPrice';
import getLeaderboard from '@/lib/getLeaderboard';
import getNames from '@/lib/getNames';
import getSortedLeaderboard from '@/lib/getSortedLeaderboard';
import getSoundData from '@/lib/getSoundData';
import getZoraData from '@/lib/getZoraData';
import mergeLeaderboardData from '@/lib/mergeLeaderboardData';
import { ethPublicClient } from '@/lib/publicClient';
import { NextRequest } from 'next/server';
import { normalize } from 'viem/ens';

export const runtime = 'edge';

const regularFont = fetch(new URL('/public/assets/HelveticaNeueMedium.ttf', import.meta.url)).then(
  (res) => res.arrayBuffer(),
);
const boldFont = fetch(new URL('/public/assets/HelveticaNeueBold.ttf', import.meta.url)).then(
  (res) => res.arrayBuffer(),
);

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams;
  let creator: any = queryParams.get('creator');
  const { USD } = await getEthPrice();
  const [zoraData, soundData] = await Promise.all([
    getZoraData(creator),
    getSoundData(creator, USD),
  ]);
  console.log('zoraData', zoraData);
  console.log('soundData', soundData);
  const zoraFiltered = getLeaderboard(zoraData.response, USD);
  const merged = mergeLeaderboardData(zoraFiltered, soundData);
  const sorted = getSortedLeaderboard(merged);
  const filtered = await getNames(sorted.splice(0, 100));
  try {
    creator = await ethPublicClient.getEnsName({
      address: normalize(creator as string) as any,
    });
  } catch (err) {
    console.error(err);
  }

  const [regularFontData, boldFontData] = await Promise.all([regularFont, boldFont]);

  const { ImageResponse } = await import('@vercel/og');
  const imageWidth = 1200;
  const imageHeight = 1200;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          backgroundImage:
            'url("https://nftstorage.link/ipfs/bafybeiboye2kdtyziefq35p44z3sikceuehlvqn772k3h63sn6riwbbbku")',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          fontFamily: '"HelveticaBold"',
          height: '100%',
        }}
        tw="flex flex-col px-3"
      >
        <ArtistTitle creator={creator} />
        <Leaderboard leaderboard={filtered.slice(0, 5)} />
        <FrameFooter />
      </div>
    ),
    {
      width: imageWidth,
      height: imageHeight,
      fonts: [
        {
          name: 'Helvetica',
          data: regularFontData,
          weight: 400,
        },
        {
          name: 'HelveticaBold',
          data: boldFontData,
          weight: 700,
        },
      ],
    },
  );
}