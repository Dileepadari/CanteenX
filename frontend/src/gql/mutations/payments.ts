// src/gql/mutations/payments.ts
import { gql } from 'graphql-tag';

export const INITIATE_PAYMENT = gql`
  mutation InitiatePayment($input: InitiatePaymentInput!) {
    initiatePayment(input: $input) {
      payment_id
      order_id
      amount
      payment_method
      razorpay_order_id
      status
    }
  }
`;

export const VERIFY_PAYMENT = gql`
  mutation VerifyPayment($input: VerifyPaymentInput!) {
    verifyPayment(input: $input) {
      payment_id
      order_id
      status
      message
    }
  }
`;
