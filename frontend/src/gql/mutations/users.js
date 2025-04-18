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

export const CAS_REDIRECT_QUERY = `
  mutation {
    InitiateCasLogin
}
`

export const CAS_VERIFY_QUERY = `
mutation {
    verify_cas_ticket(ticket: "YOUR_TICKET_HERE") {
      success
      message
      redirectUrl
      token
    }
}

`