import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { InfiniteTweetList } from "~/components/InfiniteTweetList";
import { NewTweetForm } from "~/components/NewTweetForm";
import { api } from "~/utils/api";
import { getIsAuthenticated } from "~/utils/helpers";

const TABS: Record<string, JSX.Element> = {
  Recent: <RecentTweets />,
  Following: <FollowingTweets />,
};

const Home: NextPage = () => {
  const tabsNames = Object.keys(TABS);
  const [selectedTab, setSelectedTab] = useState<(typeof tabsNames)[number]>(
    tabsNames[0] ?? ""
  );
  const CurrentTabElement = TABS[selectedTab];

  const selectedTabStyles = "border-b-4 border-b-blue-500 font-bold";
  const getTabStyles = (tab: string) =>
    `focus-visible-gray-200 flex-grow p-2 hover:bg-gray-200 ${
      tab === selectedTab ? selectedTabStyles : ""
    }`;

  const session = useSession();
  const isAuthenticated = getIsAuthenticated(session.status);

  return (
    <>
      <header className="sticky top-0 z-10 border-b bg-white pt-2">
        <h1 className="mb-2 px-4 text-lg font-bold">Home</h1>
        {isAuthenticated && (
          <div className="flex">
            {tabsNames.map((tab) => (
              <button
                key={tab}
                className={getTabStyles(tab)}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </header>
      <NewTweetForm />
      {CurrentTabElement}
    </>
  );
};

function RecentTweets() {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {},
    { getNextPageParam: (lastPAge) => lastPAge.nextCursor }
  );
  return (
    <InfiniteTweetList
      tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={!!tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  );
}

function FollowingTweets() {
  const tweets = api.tweet.infiniteFeed.useInfiniteQuery(
    { onlyFollowing: true },
    { getNextPageParam: (lastPage) => lastPage.nextCursor }
  );

  return (
    <InfiniteTweetList
      tweets={tweets.data?.pages.flatMap((page) => page.tweets)}
      isError={tweets.isError}
      isLoading={tweets.isLoading}
      hasMore={!!tweets.hasNextPage}
      fetchNewTweets={tweets.fetchNextPage}
    />
  );
}

export default Home;
