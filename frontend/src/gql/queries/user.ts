import { gql } from "graphql-tag";

export const GET_USERS_QUERY = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
    }
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
    }
  }
`;
