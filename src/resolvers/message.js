import { combineResolvers } from 'graphql-resolvers';

import pubsub, { EVENTS } from '../subscription';
import { isAuthenticated, isMessageOwner } from './authorization';
import { models } from 'mongoose';

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string => 
    Buffer.from(string, 'base64').toString('ascii');

export default {
    Query: {
        messages: async (parent, { cursor, limit = 100 }, { models }) => {
            const cursorOptions = cursor
                ? {
                    createdAt: {
                        $lt: fromCursorHash(cursor)
                    },
                  }
                : {};
            const message = await models.Message.find(
                cursorOptions,
                null,
                {
                    sort: { createdAt: -1 },
                    limit: limit + 1,
                },
            );

            const hasNextPage = message.length > limit;
            const edges = hasNextPage ? message.slice(0, -1) : messages;

            return {
                edges,
                pageInfo: {
                    hasNextPage,
                    endCursor: toCursorHash(
                        edges[edges.length - 1].createdAt.toString(),
                    ),
                },
            };

        },
        message: async (parent, { id }, { models }) => {
            return await models.Message.findById(id);
        },
    },

    Mutation: {
        createMessage: combineResolvers(
            isAuthenticated,
            async (parent, { text }, { models, me }) => {
                const message = await models.Message.create({
                    text,
                    userId: me.id,
                });

                pubsub.publish(EVENTS.MESSAGE.CREATED, {
                    messageCreated: { message },
                });

                return message;
            },
        ),
        
        deleteMessage: combineResolvers(
            isAuthenticated,
            isMessageOwner,
            async (parent, { id }, { models }) => {
                const message = await models.Message.findById(id);

                if(message) {
                    await message.remove();
                    return true;
                } else {
                    return false
                }
            },
        ),
    },

    Message: {
        user: async (message, args, { loaders }) => {
            return await loaders.user.load(message.userId);
        },
    },

    Sunscription: {
        messageCreated: {
            subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED),
        },
    },
};