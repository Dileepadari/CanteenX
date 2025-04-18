import { gql } from "graphql-tag";

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const ADD_USER_MUTATION = gql`
  mutation AddUser($input: AddUserInput!) {
    addUser(input: $input) {
      id
      name
      email
      role
    }
  }
`;
