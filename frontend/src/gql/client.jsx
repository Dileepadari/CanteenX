import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';


const client = new ApolloClient({
    uri: '/api/graphql',
    cache: new InMemoryCache(),
    });
const GqlProvider = ({ children }) => {
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}
export { client, GqlProvider };