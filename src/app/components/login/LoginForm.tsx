"use client";
import Link from "next/link";
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
  const apiEndpoint = "http://localhost:8081/api";

  const fetchUser = async (token: string) => {
    const data = await fetch(apiEndpoint + "/me", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  };

  const login = async (email: string, password: string) => {
    const data = {
      email: email,
      password: password,
    };
    const response = await fetch(apiEndpoint + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response;
  };

  const sendTokenToServer = async (token: any, refreshToken: any) => {
    try {
      const response = await fetch("/api/set-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(token, refreshToken),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error setting cookie: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error setting cookie:", error);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Login
    const loginResponse = await login(email, password);

    if (loginResponse.ok) {
      const data = await loginResponse.json();
      if (data) {
        const { token, refreshToken } = data;
        // localStorage.setItem("token", token);
        await sendTokenToServer(token, refreshToken);

        // ambil data user jika token tidak kosong
        if (token != null) {
          const getUserResponse = await fetchUser(token);
          if (getUserResponse.ok) {
            const userData = await getUserResponse.json();
            sessionStorage.setItem("user", JSON.stringify(userData));
            console.log(userData);
            router.push("/");
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
