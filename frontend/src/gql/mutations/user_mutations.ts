import { gql } from "@apollo/client";

export const UPDATE_USER_PROFILE = gql`
    mutation UpdateUserProfile($name: String, $email: String) {
        updateUser(name: $name, email: $email) {
            id
            name
            email
        }
    }
`;

export const UPDATE_PROFILE_PICTURE = gql`
    mutation UpdateProfilePicture($profilePicture: String!) {
        updateProfilePicture(profilePicture: $profilePicture) {
            id
            profilePicture
        }
    }
`;
