// frontend/src/gql/queries/users.js
export const AUTHENTICATE_USER_QUERY = `
  mutation {
  login(username: "admin", password: "yourpassword") {
    message
    user {
      id
      username
      role
    }
  }
}
`