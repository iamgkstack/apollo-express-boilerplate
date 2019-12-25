import { gql } from 'apollo-server-express';

export default gql`
    extends type Query {
        users: [User!]
        user(id: ID!): User
        me: User
    }

    extends type Mutattion {
        signUp(
            username: String!
            email: String!
            password: String!
        ): Token!

        signIn(login: String!, password: String!): Token!
        updateUser(username: String!): User!
        deleteUser(id: ID!): Boolean!
    }

    type Token {
        token: String!
    }

    type User {
        id: ID!
        username: String!
        email: String!
        role: String
        message: [Message!]
    }
`