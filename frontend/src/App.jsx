import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Profile from "./pages/Profile";
import Applications from "./pages/Applications";
import Interviews from "./pages/Interviews";
import Companies from "./pages/companies";
import Placement from "./pages/Placement";
import CreateJob from "./pages/CreateJob";
import ManageStudents from "./pages/ManageStudents";

function App() {
  const token =
    localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            token ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/applications"
          element={<Applications />}
        />

        <Route
          path="/interviews"
          element={<Interviews />}
        />

        <Route
          path="/companies"
          element={<Companies />}
        />

        <Route
          path="/placements"
          element={<Placement />}
        />

        <Route
          path="/manage-students"
          element={<ManageStudents />}
        />

        <Route
          path="/create-job"
          element={<CreateJob />}
        />

        <Route
          path="*"
          element={
            <Navigate
              to={
                token
                  ? "/dashboard"
                  : "/login"
              }
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;