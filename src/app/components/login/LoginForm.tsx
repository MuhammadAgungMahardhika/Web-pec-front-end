"use client";
import Config from "@/app/config";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "react-bootstrap";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const authserviceUrl = Config.AUTHSERVICE_URL;

  const fetchUser = async (token: string) => {
    const response = await fetch(authserviceUrl + "/me", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  };

  const login = async (email: string, password: string) => {
    const data = {
      email: email,
      password: password,
    };
    const response = await fetch(authserviceUrl + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response;
  };

  const sendTokenToServer = async (accessToken: any, refreshToken: any) => {
    const data = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };

    const response = await fetch("/api/set-cookie", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Login
    const loginResponse = await login(email, password);

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      if (data) {
        const { access_token, refresh_token } = data.data;
        console.log(access_token);
        console.log(refresh_token);
        const sendTokenResponse = await sendTokenToServer(
          access_token,
          refresh_token
        );
        // ambil data user jika token tidak kosong
        if (sendTokenResponse.ok) {
          const getUserResponse = await fetchUser(access_token);
          if (getUserResponse.ok) {
            const userData = await getUserResponse.json();
            sessionStorage.setItem("user", JSON.stringify(userData.data));
            console.log(userData);
            router.push("/transaction");
          } else {
            const errorData = await getUserResponse.json();
            console.log(errorData);
          }
        }
      } else {
        console.log("no data");
      }
    } else {
      const errorData = await loginResponse.json();
      console.log(errorData);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
        <Form.Label column sm="2">
          Email
        </Form.Label>
        <Col sm="10">
          <Form.Control
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </Col>
      </Form.Group>

      <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
        <Form.Label column sm="2">
          Password
        </Form.Label>
        <Col sm="10">
          <Form.Control
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Col>
      </Form.Group>
      <Button variant="primary" type="submit">
        Login
      </Button>
    </Form>
  );
}

export default LoginForm;
