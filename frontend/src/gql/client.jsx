import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

// Get API URL from environment variables
// Vite exposes env variables that start with VITE_ prefix
const API_URL = import.meta.env.VITE_API_URL || '';
const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || '/api/graphql';

// Construct the full GraphQL URI
// If API_URL is empty, it will use relative path (useful when served from same origin)
const graphqlUri = API_URL ? `${API_URL}${GRAPHQL_ENDPOINT}` : GRAPHQL_ENDPOINT;

console.log('🚀 GraphQL Client Configuration:', {
    API_URL,
    GRAPHQL_ENDPOINT,
    graphqlUri,
    environment: import.meta.env.VITE_ENVIRONMENT || 'production'
});

const client = new ApolloClient({
    uri: graphqlUri,
    cache: new InMemoryCache(),
    credentials: 'include', // Include cookies for authentication
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
        },
    },
});

const GqlProvider = ({ children }) => {
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}

export { client, GqlProvider };
