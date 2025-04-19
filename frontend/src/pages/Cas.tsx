import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CAS_VERIFY_QUERY } from "@/gql/mutations/users";
import { useQuery, useApolloClient } from '@apollo/client';

const Cas: React.FC = () => {
    const client = useApolloClient();
    const navigate = useNavigate();

    React.useEffect(() => {
        const verifyTicket = async () => {
            // Extract the ticket parameter from the URL
            const urlParams = new URLSearchParams(window.location.search);
            const ticket = urlParams.get('ticket');

            if (!ticket) {
                console.error("Error: No ticket found in the URL.");
                return;
            }

            try {
                const { data } = await client.mutate({
                    mutation: CAS_VERIFY_QUERY,
                    variables: { ticket },
                    fetchPolicy: 'network-only',
                });
                if(data){
                    navigate('/'); // Redirect to the home page or any other page after successful login
                }
            } catch (error) {
                console.error("Error verifying ticket:", error);
            }
        };

        verifyTicket();
    }, [client, navigate]);

    return (
        <div>
            <h1>CAS Login</h1>
            <p>Please wait while we verify your credentials...</p>
        </div>
    );
};

export default Cas;