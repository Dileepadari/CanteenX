import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useApolloClient } from '@apollo/client';
import { VERIFY_CAS_TICKET_MUTATION } from '@/gql/mutations/auth_mutations';
import { GET_CURRENT_USER_QUERY } from '@/gql/queries/user_queries';
import { useUserStore } from '@/stores/userStore';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Cas = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const client = useApolloClient();
    const { login } = useUserStore();
    const { toast } = useToast();

    const [verifyTicket, { loading, error }] = useMutation(VERIFY_CAS_TICKET_MUTATION);

    useEffect(() => {
        const handleCasCallback = async () => {
            const searchParams = new URLSearchParams(location.search);
            const ticket = searchParams.get('ticket');

            if (ticket) {
                try {
                    const { data } = await verifyTicket({ variables: { ticket } });
                    if (data?.verifyCasTicket?.success) {
                        const { data: userData } = await client.query({
                            query: GET_CURRENT_USER_QUERY,
                            fetchPolicy: 'network-only',
                        });
                        if (userData?.getCurrentUser) {
                            login(userData.getCurrentUser);
                            toast({
                                title: 'CAS Login Successful',
                                description: `Welcome, ${userData.getCurrentUser.name}!`,
                            });
                            navigate('/');
                        } else {
                            throw new Error('Could not fetch user data after CAS login.');
                        }
                    } else {
                        throw new Error(data?.verifyCasTicket?.message || 'CAS verification failed.');
                    }
                } catch (e) {
                    toast({
                        title: 'CAS Login Failed',
                        description: e.message || 'An unexpected error occurred.',
                        variant: 'destructive',
                    });
                    navigate('/login');
                }
            } else {
                toast({
                    title: 'CAS Error',
                    description: 'No ticket found in callback URL.',
                    variant: 'destructive',
                });
                navigate('/login');
            }
        };

        handleCasCallback();
    }, [location, navigate, verifyTicket, client, login, toast]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-lg font-medium">Verifying your CAS ticket...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 text-red-500">
                <p className="text-lg font-medium">CAS Authentication Failed</p>
                <p>{error.message}</p>
            </div>
        );
    }

    return null;
};

export default Cas;