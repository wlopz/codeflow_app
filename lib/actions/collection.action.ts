"use server";

import { Collection, Question } from "@/database";
import { CollectionBaseSchema } from "../validations";
import handleError from "../handlers/error";
import { revalidatePath } from "next/cache";
import { ROUTE } from "@/constants/routes";
import action from "../handlers/action";

export async function toggleSaveQuestion(
  params: CollectionBaseParams
): Promise<ActionResponse<{ saved: boolean }>> {
  const validationResult = await action({
    params,
    schema: CollectionBaseSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { questionId } = validationResult.params!;
  const userId = validationResult.session?.user?.id;

  try {
    const question = await Question.findById(questionId);
    if (!question) throw new Error("Question not found");

    const collection = await Collection.findOne({
      question: questionId,
      author: userId,
    });

    if (collection) {
      await Collection.findByIdAndDelete(collection.id);
    }

    if (!collection) {
      await Collection.create({
        question: questionId,
        author: userId,
      });
    }

    revalidatePath(ROUTE.QUESTION(questionId));

    return {
      success: true,
      data: { saved: true },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
