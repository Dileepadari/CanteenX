/**
 * GraphQL mutations for complaint functionality
 */

import { gql } from "graphql-tag";

/**
 * Mutation to create a new complaint
 */
export const CREATE_COMPLAINT = gql`
  mutation CreateComplaint(
    $userId: String!,
    $orderId: Int!,
    $complaintText: String!,
    $heading: String!,
    $complaintType: String!,
    $status: String = "pending",
    $isEscalated: Boolean = false,
    $responseText: String
  ) {
    createComplaint(
      userId: $userId,
      orderId: $orderId,
      complaintText: $complaintText,
      heading: $heading,
      complaintType: $complaintType,
      status: $status,
      isEscalated: $isEscalated,
      responseText: $responseText
    ) {
      success
      message
    }
  }
`;

/**
 * Mutation to update an existing complaint
 */
export const UPDATE_COMPLAINT = gql`
  mutation UpdateComplaint(
    $complaintId: Int!,
    $complaintText: String,
    $heading: String,
    $complaintType: String,
    $status: String,
    $isEscalated: Boolean,
    $responseText: String
  ) {
    updateComplaint(
      complaintId: $complaintId,
      complaintText: $complaintText,
      heading: $heading,
      complaintType: $complaintType,
      status: $status,
      isEscalated: $isEscalated,
      responseText: $responseText
    ) {
      success
      message
    }
  }
`;

/**
 * Mutation to close a complaint (mark as resolved)
 */
export const CLOSE_COMPLAINT = gql`
  mutation CloseComplaint($complaintId: Int!) {
    closeComplaint(complaintId: $complaintId) {
      success
      message
    }
  }
`;

/**
 * Mutation to escalate a complaint
 */
export const ESCALATE_COMPLAINT = gql`
  mutation EscalateComplaint($complaintId: Int!) {
    escalateComplaint(complaintId: $complaintId) {
      success
      message
    }
  }
`;