import axios from "axios" ;
import React, { useEffect, useState } from "react";
import { useStateProvider } from "@/context/StateContext";
import { useRouter } from "next/router";
import { reducerCases } from "@/context/constants";
import { CHECK_USER_ROUTE } from "@/utils/ApiRoutes";
import dynamic from "next/dynamic";
import animationdata from "../components/common/animation.json";
import { FaCircleUser } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Login() {
  const router = useRouter();
 const [{ newUser }, dispatch] = useStateProvider();

  const [eId, seteId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    if (eId && password) {
      axios
        .post(CHECK_USER_ROUTE, { eId, password })
        .then((res) => {
          console.log("res", res);
          if (res.data.status) {
            if (res.data.onBoarding == 0) {
dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
              router.push("/onboarding");
            } else {
              router.push("/");
            }
          }
        })
        .catch((error) => {
          console.log({ error });
        });
    }
  };

  return (
    <div className="wrapper">
      <div className="animationpart">
        <Lottie animationData={animationdata}></Lottie>
      </div>
      <form onSubmit={handleLogin}>
        <h1 style={{ width: "323px" }}>I N T R A S H A R E</h1>
        <h2>L O G I N</h2>
        <div className="input-box">
          <input
            type="text"
            placeholder="Employee ID"
            name="eid"
            value={eId}
            onChange={(e) => seteId(e.target.value)}
            required
          />

          <FaCircleUser className="icon" />
        </div>
        <div className="input-box">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <FaLock className="icon" />
        </div>

        <button type="submit" onClick={handleLogin}>
          LOGIN
        </button>
      </form>
    </div>
  );
}
