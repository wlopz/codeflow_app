/* eslint-disable no-undef */
"use server";

// Import mongoose for database interactions and ClientSession for transactions
import mongoose, { ClientSession } from "mongoose";

// Import the Answer, Question, and Vote models from the database
import { Answer, Question, Vote } from "@/database";

// Import helper functions: action validates and processes requests; handleError formats errors
import action from "../handlers/action";
import handleError from "../handlers/error";
// Import Zod schemas for validating incoming parameters
import {
  CreateVoteSchema,
  HasVotedSchema,
  UpdateVoteCountSchema,
} from "../validations";
import { revalidatePath } from "next/cache";
import ROUTES from "@/constants/routes";

/**
 * Updates the vote count for a question or answer.
 * @param params - Parameters including targetId, targetType, voteType, and change amount
 * @param session - Optional mongoose ClientSession for transactional updates
 * @returns An ActionResponse indicating success or failure
 */
export async function updateVoteCount(
  params: UpdateVoteCountParams,
  session?: ClientSession
): Promise<ActionResponse> {
  // Validate parameters against the UpdateVoteCountSchema
  const validationResult = await action({
    params,
    schema: UpdateVoteCountSchema,
  });

  // If validation fails, return the formatted error response
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  // Destructure validated parameters
  const { targetId, targetType, voteType, change } = validationResult.params!;

  // Select the correct model based on the type of target (question or answer)
  const Model = targetType === "question" ? Question : Answer;
  // Determine which vote field to update (upvotes or downvotes)
  const voteField = voteType === "upvote" ? "upvotes" : "downvotes";

  try {
    // Find the document by ID and increment the appropriate vote field by 'change'
    const result = await Model.findByIdAndUpdate(
      targetId,
      { $inc: { [voteField]: change } },
      { new: true, session }
    );

    // If no document was updated, handle the error
    if (!result)
      return handleError(
        new Error("Failed to update vote count")
      ) as ErrorResponse;

    // Return success if update succeeded
    return { success: true };
  } catch (error) {
    // Handle any database or other errors
    return handleError(error) as ErrorResponse;
  }
}

/**
 * Creates, toggles, or updates a vote by a user on a question or answer.
 * @param params - Parameters including targetId, targetType, and voteType
 * @returns An ActionResponse indicating success or failure
 */
export async function createVote(
  params: CreateVoteParams
): Promise<ActionResponse> {
  // Validate input and ensure the user is authorized
  const validationResult = await action({
    params,
    schema: CreateVoteSchema,
    authorize: true,
  });

  // Return error response if validation fails
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  // Extract validated parameters
  const { targetId, targetType, voteType } = validationResult.params!;
  // Get the user ID from the session (authorization middleware should have populated this)
  const userId = validationResult.session?.user?.id;

  // If user is not authenticated, handle as unauthorized
  if (!userId) handleError(new Error("Unauthorized")) as ErrorResponse;

  // Start a database session and transaction for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the user has already cast a vote on this target
    const existingVote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    }).session(session);

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // If the same voteType exists, remove the vote (toggle off)
        await Vote.deleteOne({ _id: existingVote._id }).session(session);
        // Decrement the vote count by 1
        await updateVoteCount(
          { targetId, targetType, voteType, change: -1 },
          session
        );
      } else {
        // If a different voteType exists, update the vote record to the new type
        await Vote.findByIdAndUpdate(
          existingVote._id,
          { voteType },
          { new: true, session }
        );
        // Increment the vote count for the new type
        await updateVoteCount(
          { targetId, targetType, voteType, change: 1 },
          session
        );
      }
    } else {
      // If no vote exists yet, create a new Vote document
      await Vote.create(
        [
          {
            author: userId,
            actionId: targetId,
            actionType: targetType,
            voteType,
          },
        ],
        { session }
      );
      // Increment the vote count by 1
      await updateVoteCount(
        { targetId, targetType, voteType, change: 1 },
        session
      );
    }

    // Commit the transaction and end the session
    await session.commitTransaction();
    session.endSession();

    revalidatePath(ROUTES.QUESTION(targetId))

    // Return success response
    return { success: true };
  } catch (error) {
    // Abort transaction on error and clean up session
    await session.abortTransaction();
    session.endSession();
    // Handle and return the error
    return handleError(error) as ErrorResponse;
  }
}

export async function hasVoted(
  params: HasVotedParams
): Promise<ActionResponse<HasVotedResponse>> {
  const validationResult = await action({
    params,
    schema: HasVotedSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { targetId, targetType } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const vote = await Vote.findOne({
      author: userId,
      actionId: targetId,
      actionType: targetType,
    });

    if (!vote) {
      return { success: false, data: { hasUpvoted: false, hasDownvoted: false } };
    }

    return {
      success: true,
      data: {
        hasUpvoted: vote.voteType === "upvote",
        hasDownvoted: vote.voteType === "downvote",
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
