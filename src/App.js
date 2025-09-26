import { useState } from "react";
import Login from "./components/Login";
import AdminPanel from "./components/AdminPanel";
import Portfolio from "./components/Portfolio";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <div>
      {loggedIn ? <AdminPanel loggedIn={loggedIn} setLoggedIn={setLoggedIn} /> : <Login setLoggedIn={setLoggedIn} />}
      {/* <Portfolio /> */}
    </div>
  );
}

export default App;
