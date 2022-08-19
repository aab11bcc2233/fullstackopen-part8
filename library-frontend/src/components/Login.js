import { useMutation } from "@apollo/client";
import { printIntrospectionSchema } from "graphql";
import React, { useEffect, useState } from "react";
import { ALL_AUTHORS, ALL_BOOKS, LOGIN } from "../queries";

const Login = ({ show, setError, setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, result] = useMutation(LOGIN, {
    refetchQueries: [
      {
        query: ALL_BOOKS,
      },
      {
        query: ALL_AUTHORS,
      },
    ],
    onError: (error) => {
      setError(error.graphQLErrors[0].message);
    },
  });

  useEffect(() => {
    if (result.data) {
      setUsername("")
      setPassword("")

      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem("user-token", token);
    }
  }, [result.data]);

  const clickLogin = async (event) => {
    event.preventDefault();
    // console.log("username:", username);
    // console.log("password:", password);

    login({
      variables: {
        username,
        password,
      },
    });
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      <form onSubmit={clickLogin}>
        <div>
          username:
          <input
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
        </div>

        <div>
          password:
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

export default Login;
