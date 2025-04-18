"use client";

import React, { useState } from "react";
import { useQuery } from "urql";
import { AUTHENTICATE_USER_QUERY } from "../gql/queries/users";

import { executeGraphQL } from '../utils/graphql';

const LoginForm = ({ title }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [result, reexecuteQuery] = useQuery({
    query: AUTHENTICATE_USER_QUERY,
    variables: formData,
    pause: true, // Prevent the query from running automatically
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    reexecuteQuery(); // Trigger the query
    if (result.data?.authenticateUser) {
      console.log("User authenticated:", result.data.authenticateUser);
    } else {
      console.error("Authentication failed:", result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;