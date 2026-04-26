import { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Layout from "./Layout";
import PageLoader from "../components/PageLoader";
import ProtectedRoute from "../components/ProtectedRoute";

const Home       = lazy(() => import("../pages/Home"));
const Discover   = lazy(() => import("../pages/Discover"));
const MoodPicker = lazy(() => import("../pages/MoodPicker"));
const Detail     = lazy(() => import("../pages/Detail"));
const Search     = lazy(() => import("../pages/Search"));
const Watchlist  = lazy(() => import("../pages/Watchlist"));
const Profile    = lazy(() => import("../pages/Profile"));
const Login      = lazy(() => import("../pages/Login"));
const NotFound   = lazy(() => import("../pages/NotFound"));

export default function AppRouter() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>

          {/* "/" always goes to login — unauthenticated first visit */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected — ProtectedRoute only redirects if user is null */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/home"      element={<Home />} />
              <Route path="/discover"  element={<Discover />} />
              <Route path="/mood"      element={<MoodPicker />} />
              <Route path="/search"    element={<Search />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/profile"   element={<Profile />} />
              <Route path="/movie/:id" element={<Detail />} />
              <Route path="/tv/:id"    element={<Detail />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />

        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}
