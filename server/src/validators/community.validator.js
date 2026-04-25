const Joi = require('joi');

// Schema for creating a new discussion
const discussionSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200) // Reasonable max length
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),

  content: Joi.string()
    .min(5)
    .max(10000) // Reasonable max length for content
    .required()
    .messages({
      'string.min': 'Content must be at least 5 characters long',
      'string.max': 'Content cannot exceed 10,000 characters',
      'any.required': 'Content is required'
    })
});

// Schema for adding a comment
const commentSchema = Joi.object({
  text: Joi.string()
    .min(1)
    .max(2000) // Reasonable max length for comments
    .required()
    .messages({
      'string.min': 'Comment cannot be empty',
      'string.max': 'Comment cannot exceed 2,000 characters',
      'any.required': 'Comment text is required'
    })
});

// Schema for voting on discussions or comments
const voteSchema = Joi.object({
  type: Joi.string()
    .valid('upvote', 'downvote')
    .required()
    .messages({
      'any.only': 'Vote type must be either "upvote" or "downvote"',
      'any.required': 'Vote type is required'
    })
});

module.exports = {
  discussionSchema,
  commentSchema,
  voteSchema
};