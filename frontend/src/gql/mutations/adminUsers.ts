import { gql } from "graphql-tag";

export const CREATE_VENDOR = gql`
  mutation CreateVendor($name: String!, $email: String!, $password: String!, $role: String!) {
    createVendor(name: $name, email: $email, password: $password, role: $role) {
      id
      name
      email
      role
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($userId: String!, $name: String, $email: String, $role: String) {
    updateUser(userId: $userId, name: $name, email: $email, role: $role) {
      id
      name
      email
      role
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($userId: String!) {
    deleteUser(userId: $userId)
  }
`;

export const ASSIGN_STAFF_TO_CANTEEN = gql`
  mutation AssignStaffToCanteen($canteenId: Int!, $userIds: [String!]!) {
    assignStaffToCanteen(canteenId: $canteenId, userIds: $userIds)
  }
`;

export const REMOVE_STAFF_FROM_CANTEEN = gql`
  mutation RemoveStaffFromCanteen($canteenId: Int!, $userIds: [String!]!) {
    removeStaffFromCanteen(canteenId: $canteenId, userIds: $userIds)
  }
`;
