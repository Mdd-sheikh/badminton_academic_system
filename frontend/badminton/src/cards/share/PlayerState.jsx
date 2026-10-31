import { Link } from "react-router-dom";
import "./PlayerState.css";

// Shown by every player page while the academy database loads, or when
// the logged-in user has no player linked to them.
export default function PlayerState({ loading }) {
  if (loading) {
    return <div className="pst" role="status"><p>Loading your academy data...</p></div>;
  }
  return (
    <div className="pst">
      <h2>No player linked</h2>
      <p>Sign in with your player code to see your sessions, matches and progress.</p>
      <Link to="/login">Go to sign in</Link>
    </div>
  );
}
