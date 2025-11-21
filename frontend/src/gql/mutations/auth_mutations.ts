import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      message
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
    mutation Signup($name: String!, $email: String!, $password: String!) {
        signup(name: $name, email: $email, password: $password) {
            message
            user {
                id
                name
                email
                role
            }
        }
    }
`;

export const INITIATE_CAS_LOGIN_MUTATION = gql`
  mutation InitiateCasLogin {
    initiateCasLogin
  }
`;

export const VERIFY_CAS_TICKET_MUTATION = gql`
    mutation VerifyCasTicket($ticket: String!) {
        verifyCasTicket(ticket: $ticket) {
            success
            message
            role
        }
    }
`;

export const LOGOUT_MUTATION = gql`
    mutation Logout {
        logout
    }
`;
