import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

export default function EditProfile() {
  const { user, setUser } = useContext(AuthContext);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    if (user) {
      console.log("Current User:", user);
      console.log("User Profile from AuthContext:", user.profile);
      setProfile(user.profile || {
        linkedin: "",
        github: "",
        instagram: "",
        whatsapp: "",
        skills: [],
        jobRole: "",
        company: "",
        about: ""
      });
    }
  }, [user]);

  const saveProfile = async () => {
    if (profile.whatsapp && !/^\d{10,15}$/.test(profile.whatsapp)) {
      return alert("WhatsApp number must include country code only");
    }

    try {
      const res = await API.put("/users/update", profile);
      setUser(res.data);
      alert("Profile updated successfully");
    } catch (err) {
      alert("Error updating profile");
    }
  };

  return (
    <div className="form">
      <h2>Edit Profile</h2>

      <input
        placeholder="LinkedIn"
        value={profile.linkedin || ""}
        onChange={e => setProfile({ ...profile, linkedin: e.target.value })}
      />

      <input
        placeholder="GitHub"
        value={profile.github || ""}
        onChange={e => setProfile({ ...profile, github: e.target.value })}
      />

      <input
        placeholder="Instagram"
        value={profile.instagram || ""}
        onChange={e => setProfile({ ...profile, instagram: e.target.value })}
      />

      <input
        placeholder="WhatsApp (with country code)"
        value={profile.whatsapp || ""}
        onChange={e => setProfile({ ...profile, whatsapp: e.target.value })}
      />

      <input
        placeholder="Skills (comma separated)"
        value={profile.skills?.join(", ") || ""}
        onChange={e =>
          setProfile({
            ...profile,
            skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
          })
        }
      />

      <input
        placeholder="Job Role"
        value={profile.jobRole || ""}
        onChange={e => setProfile({ ...profile, jobRole: e.target.value })}
      />

      <input
        placeholder="Company"
        value={profile.company || ""}
        onChange={e => setProfile({ ...profile, company: e.target.value })}
      />

      <textarea
        placeholder="About"
        value={profile.about || ""}
        onChange={e => setProfile({ ...profile, about: e.target.value })}
      />

      <button onClick={saveProfile}>Save Changes</button>
    </div>
  );
}