import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';


const client = new ApolloClient({
    uri: 'http://backend:8000/api/graphql',
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