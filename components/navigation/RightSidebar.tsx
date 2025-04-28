import Image from "next/image";
import Link from "next/link";
import React from "react";

import TagCard from "@/components/cards/TagCard";
import ROUTES from "@/constants/routes";
import { getHotQuestions } from "@/lib/actions/question.action";
import { getTopTags } from "@/lib/actions/tag.action";

import DataRenderer from "../DataRenderer";

// const hotQuestions = [
//   { _id: "1", title: "How to create a custom hook in React?" },
//   { _id: "2", title: "How to use React Query with Next.js?" },
//   { _id: "3", title: "How to use Redux with React?" },
//   { _id: "4", title: "How to use React Router" },
//   { _id: "5", title: "How to use React Context API?" },
// ];

// const popularTags = [
//   { _id: "1", name: "react", questions: 100 },
//   { _id: "2", name: "javascript", questions: 200 },
//   { _id: "3", name: "typescript", questions: 150 },
//   { _id: "4", name: "nextjs", questions: 50 },
//   { _id: "5", name: "react-query", questions: 75 },
// ];

const RightSidebar = async () => {
  // const { success, data: hotQuestions, error } = await getHotQuestions();
  // const { success: tagSuccess, data: topTags, error: tagError } = await getTopTags();

  const [
    { success, data: hotQuestions, error },
    { success: tagSuccess, data: topTags, error: tagError },
  ] = await Promise.all([getHotQuestions(), getTopTags()]);

  return (
    <section className="custom-scrollbar background-light900_dark200 light-border sticky right-0 top-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <DataRenderer
          data={hotQuestions}
          empty={{
            title: "No Hot Questions",
            message: "There are no hot questions at the moment.",
          }}
          error={error}
          success={success}
          render={(hotQuestions) => (
            <div className="mt-7 flex w-full flex-col gap-[30px]">
              {hotQuestions.map(({ _id, title }) => (
                <Link
                  key={_id}
                  href={ROUTES.QUESTION(_id)}
                  className="flex cursor-pointer items-center justify-between gap-7"
                >
                  <p className="body-medium text-dark500_light700 line-clamp-2">
                    {title}
                  </p>
                  <Image
                    src="/icons/chevron-right.svg"
                    alt="Chevron Right"
                    width={20}
                    height={20}
                    className="invert-colors"
                  />
                </Link>
              ))}
            </div>
          )}
        />
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <DataRenderer
          data={topTags}
          empty={{
            title: "No Tags Found",
            message: "There are no popular tags at the moment.",
          }}
          error={tagError}
          success={tagSuccess}
          render={(topTags) => (
            <div className="mt-7 flex flex-col gap-4">
              {topTags.map(({ _id, name, questions }) => (
                <TagCard
                  key={_id}
                  _id={_id}
                  name={name}
                  questions={questions}
                  showCount
                  compact
                />
              ))}
            </div>
          )}
        />
      </div>
    </section>
  );
};

export default RightSidebar;
