import React from "react";
import LoginForm from "../components/login/LoginForm";

const login = () => {
  return (
    <>
      <div className="card">
        <div className="card-header">
          <h3>Login</h3>
        </div>
        <div className="card-body">
          <div className="card">
            <div className="card-body shadow">
              <LoginForm></LoginForm>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default login;
