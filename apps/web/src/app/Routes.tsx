import React, { useEffect } from 'react';

import { MessageDescriptor } from '@lingui/core';
import { defineMessage } from '@lingui/macro';
import { Helmet } from 'react-helmet-async';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';

import { DefaultLayout } from 'app/components/Layout';

import { lazyLoad } from 'utils/loadable';

import { HomePage } from './containers/HomePage/Loadable';
import { TradePage } from './containers/TradePage/Loadable';

// import { VotePage } from './pages/vote/page';
const VotePage = lazyLoad(
  () => import('./pages/vote/page'),
  module => module.VotePage,
);

import { ProposalListPage } from './pages/vote/proposals/page';
// import { ProposalPage } from './containers/ProposalPage/Loadable';
const ProposalDetailsPage = lazyLoad(
  () => import('./pages/vote/proposals/[proposalId]/page'),
  module => module.ProposalDetailsPage,
);
// import { NewProposalPage } from './containers/NewProposalPage/Loadable';
const ProposalNewPage = lazyLoad(
  () => import('./pages/vote/proposals/new/page'),
  module => module.ProposalNewPage,
);

import { ClaimGoodwill } from './containers/Claim/Goodwill';
import { Claim } from './containers/Claim/LegacyFees';

const routeTexts: [string, MessageDescriptor][] = [
  ['/vote', defineMessage({ message: 'Vote' })],
  ['/trade', defineMessage({ message: 'Trade' })],
  ['/', defineMessage({ message: 'Home' })],
];

const Redirect = ({ to }) => {
  useEffect(() => {
    window.location.href = to;
    throw new Error('Redirecting...');
  }, [to]);
  return null;
};

export default function RootRoutes() {
  const location = useLocation();
  const title = routeTexts.find(item => location.pathname.startsWith(item[0]))?.[1];

  return (
    <Routes>
      <Route
        path="*"
        element={
          <>
            <DefaultLayout title={title?.id}>
              <Helmet>
                <title>{title?.message}</title>
              </Helmet>
              <Outlet />
            </DefaultLayout>
          </>
        }
      >
        <Route index element={<HomePage />} />

        <Route path="trade" element={<Outlet />}>
          <Route index element={<TradePage />} />
          <Route path=":pair" element={<TradePage />} />
          <Route path="supply" element={<TradePage />} />
          <Route path="supply/:pair" element={<TradePage />} />
          <Route path="bridge/" element={<TradePage />} />
        </Route>

        <Route path="vote" element={<Outlet />}>
          <Route index element={<VotePage />} />
          <Route path="proposal-list" element={<ProposalListPage />} />
          <Route path="new-proposal" element={<ProposalNewPage />} />
          <Route path="proposal/:id" element={<ProposalDetailsPage />} />
        </Route>

        <Route path="airdrip" element={<Redirect to="https://balanced.network/" />} />
        <Route path="*" element={<Redirect to="https://balanced.network/404" />} />
      </Route>

      <Route path="/claim-legacy-fees" element={<Claim />} />
      <Route path="/claim-goodwill" element={<ClaimGoodwill />} />
    </Routes>
  );
}
