import { VERCEL_URL } from '@/lib/consts';
import LeaderboardPage from '@/components/LeaderboardPage/LeaderboardPage';
import { FrameMetadata } from '@coinbase/onchainkit';
import getButtons from '@/lib/getButtons';

const Page = ({ params }: { params: { creatorId: string } }) => (
  <>
    <FrameMetadata
      ogTitle="data muse"
      ogDescription="data muse"
      buttons={getButtons()}
      image={{
        src: `${VERCEL_URL}/api/leaderboard?creator=${params.creatorId}`,
        aspectRatio: '1:1',
      }}
      input={{
        text: 'Search a different creator',
      }}
      postUrl={`${VERCEL_URL}/api/frame`}
    />
    <meta property="of:accepts:xmtp" content="2024-02-01" />

    <LeaderboardPage creator={params.creatorId} />
  </>
);

export default Page;
