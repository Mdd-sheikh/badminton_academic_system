import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicRouter from './Routes/PublicRoute';
import { PublicLayout } from './Routes/PublicRoute';
import PrivateRoute from './Routes/PrivateRoute';
import Home from './pages/landing/home/Home';
import Auth from './auth/Authentication/Auth';
import Logout from './auth/Authentication/Logout';

// Coach
import DashboardC from './pages/coaches_page/dashboard/DashboardC';
import CoachHome from './pages/coaches_page/coaches_activity/Home/Coach_Home';
import Players from './pages/coaches_page/coaches_activity/players/Players';
import Analytics from './pages/coaches_page/coaches_activity/Analytics/Analytics';
import Batches from './pages/coaches_page/coaches_activity/Batches/Batches';
import Schedule from './pages/coaches_page/coaches_activity/schedule/Schedule';
import Attendance from './pages/coaches_page/coaches_activity/attendence/Attendance';
import Matches from './pages/coaches_page/coaches_activity/matches/Matches';
import Tournaments from './pages/coaches_page/coaches_activity/tournaments/Tournaments';
import Announcements from './pages/coaches_page/coaches_activity/announcements/Announcements';
import Notifications from './pages/coaches_page/coaches_activity/notifications/Notifications';
import Settings from './pages/coaches_page/coaches_activity/settings/Settings';

// Parent
import DashboardP from './pages/parent_pages/dashboard/Parent_Dashboard';
import ParentHome from './pages/parent_pages/parent_activity/parenthome/ParentHome';
import ChildPerformance from './pages/parent_pages/parent_activity/childperformance/Performance';
import ChildActivity from './pages/parent_pages/parent_activity/childactivity/ChildActivity';
import ChildAttendance from './pages/parent_pages/parent_activity/childattendance/ChildAttendance';
import ChildSchedule from './pages/parent_pages/parent_activity/childchedule/ChildSchedule';
import ParentNotifications from './pages/parent_pages/parent_activity/parentnotifications/ParentNotifications';
import ParentSettings from './pages/parent_pages/parent_activity/parentsettings/ParentsSettings';

// Player
import DashboardPl from './pages/players_pages/dashboard/player_Dashboard';
import PlayerHome from './pages/players_pages/player_activity/playerhome/PlayerHome';
import PlayerPerformance from './pages/players_pages/player_activity/myperformance/MyPerformance';
import PlayerTraining from './pages/players_pages/player_activity/mytraining/MyTraining';
import PlayerMatches from './pages/players_pages/player_activity/mymatches/MyMatches';
import PlayerAchievements from './pages/players_pages/player_activity/playerachievements/Achievements';
import PlayerAttendance from './pages/players_pages/player_activity/myattendance/MyAttendance';
import PlayerSchedule from './pages/players_pages/player_activity/myschedule/MySchedule';
import PlayerTournaments from './pages/players_pages/player_activity/playertournaments/PlayerTournaments';
import PlayerNotifications from './pages/players_pages/player_activity/playernotifications/PlayerNotifications';
import PlayerSettings from './pages/players_pages/player_activity/playersettings/PlayerSettings';


function App() {
  return (
    <>
      <ToastContainer />

      <Routes>
        {/* Guests only: layout + redirect if already logged in */}
        <Route element={<PublicRouter />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/verify-email" element={<Auth />} />
          <Route path="/forgot-password" element={<Auth />} />
          <Route path="/reset-password" element={<Auth />} />
        </Route>

        {/* Needs login, so layout only (no guest guard) */}
        <Route element={<PublicLayout />}>
          <Route path="/parent/link-child" element={<Auth />} />
        </Route>

        <Route path="/auth" element={<Navigate to="/login" replace />} />

        {/* Coach area: login required, then the dashboard layout */}
        <Route element={<PrivateRoute allowedRoles={["coach"]} redirectTo="/login" />}>
          { /*<Route>*/}
          <Route element={<DashboardC />}>
            <Route path="/coach/dashboard" element={<CoachHome />} />
            <Route path="/coach/players" element={<Players />} />
            <Route path="/coach/batches" element={<Batches />} />
            <Route path="/coach/analytics" element={<Analytics />} />
            <Route path="/coach/schedule" element={<Schedule />} />
            <Route path="/coach/attendance" element={<Attendance />} />
            <Route path="/coach/matches" element={<Matches />} />
            <Route path="/coach/tournaments" element={<Tournaments />} />
            <Route path="/coach/announcements" element={<Announcements />} />
            <Route path="/coach/notifications" element={<Notifications />} />
            <Route path="/coach/settings" element={<Settings />} />
            <Route path="/logout" element={<Logout />} />
          </Route>
        </Route>

        {/* Parent area: login required, then the parent dashboard layout */}
        { /*<Route element={<PrivateRoute allowedRoles={["parent"]} redirectTo="/login" />}>*/}
        {/*<Route>
          <Route element={<DashboardP />}>
            <Route path="/parent/dashboard" element={<ParentHome />} />
            <Route path="/parent/performance" element={<ChildPerformance />} />
            <Route path="/parent/activity" element={<ChildActivity />} />
            <Route path="/parent/attendance" element={<ChildAttendance />} />
            <Route path="/parent/schedule" element={<ChildSchedule />} />
            <Route path="/parent/notifications" element={<ParentNotifications />} />
            <Route path="/parent/settings" element={<ParentSettings />} />
          </Route>
        </Route>*/}

        {/* Player area: login required, then the player dashboard layout */}
        {/* Parent logins are saved as role "player", so they use this area too */}
        <Route element={<PrivateRoute allowedRoles={["player"]} redirectTo="/login" />}>
          { /*<Route>*/}
          <Route element={<DashboardPl />}>
            <Route path="/player/dashboard" element={<PlayerHome />} />
            <Route path="/player/performance" element={<PlayerPerformance />} />
            <Route path="/player/training" element={<PlayerTraining />} />
            <Route path="/player/matches" element={<PlayerMatches />} />
            <Route path="/player/achievements" element={<PlayerAchievements />} />
            <Route path="/player/schedule" element={<PlayerSchedule />} />
            <Route path="/player/attendance" element={<PlayerAttendance />} />
            <Route path="/player/tournaments" element={<PlayerTournaments />} />
            <Route path="/player/notifications" element={<PlayerNotifications />} />
            <Route path="/player/settings" element={<PlayerSettings />} />
            <Route path="/logout" element={<Logout />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App;