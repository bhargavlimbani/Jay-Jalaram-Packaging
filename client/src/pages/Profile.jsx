import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Profile() {

  const { user } = useContext(AuthContext);

  return (

    <div>

      <Navbar />

      <div className="p-10">

        <h1 className="text-3xl font-bold mb-6">
          My Profile
        </h1>

        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>

      </div>

    </div>

  );
}

export default Profile;