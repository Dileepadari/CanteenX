export const CREATE_USER_QUERY = `
    query {
    signup(username: "testuser", email: "testuser.email", password: "password", role: "student") {
      message
      user
      success
    }
  }
`