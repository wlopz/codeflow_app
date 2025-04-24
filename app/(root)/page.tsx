import Link from 'next/link'

import QuestionCard from '@/components/cards/QuestionCard';
import DataRenderer from '@/components/DataRenderer';
import CommonFilter from '@/components/filters/CommonFilter';
import HomeFilter from '@/components/filters/HomeFilter';
import Pagination from '@/components/Pagination';
import LocalSearch from '@/components/search/LocalSearch'
import { Button } from '@/components/ui/button'
import { HomePageFilters } from '@/constants/filters';
import ROUTES from '@/constants/routes'
import { EMPTY_QUESTION } from '@/constants/states';
import { getQuestions } from '@/lib/actions/question.action';
// import { auth } from '@/auth';
// import { api } from '@/lib/api';
// import handleError from '@/lib/handlers/error';
// import dbConnect from '@/lib/mongoose';

// const questions = [
//   {
//     _id: "1",
//     title: "How to learn React?",
//     description: "I want to learn React, can anyone help me?",
//     tags: [
//       { _id: "1", name: "React" },
//       { _id: "2", name: "JavaScript" },
//     ],
//     author: { _id: "1", name: "John Doe", image: 'https://avatar.iran.liara.run/public/1' },
//     upvotes: 10,
//     answers: 5,
//     views: 100,
//     createdAt: new Date(),
//   },
//   {
//     _id: "2",
//     title: "How to learn JavaScript?",
//     description: "I want to learn JavaScript, can anyone help me?",
//     tags: [
//       { _id: "1", name: "JavaScript" },
//       { _id: "2", name: "JavaScript" },
//     ],
//     author: { _id: "1", name: "Jane Doe", image: 'https://static.vecteezy.com/system/resources/thumbnails/004/899/680/small/beautiful-blonde-woman-with-makeup-avatar-for-a-beauty-salon-illustration-in-the-cartoon-style-vector.jpg' },
//     upvotes: 10,
//     answers: 5,
//     views: 100,
//     createdAt: new Date('2023-01-01'),
//   },
// ];

// const test = async () => {
//   try {
//     return await api.users.getAll()
//   } catch (error) {
//     return handleError(error)
//   }
    
// }

// const test = async () => {
//   try {
//     await dbConnect()
//   } catch (error) {
//     return handleError(error)
//   }
    
// }

interface SearchParams {
  searchParams: Promise<{[key: string]: string}>;
}

const Home = async ({ searchParams }: SearchParams) => {
  // const users = await test()
  // const session = await auth();

  // console.log("Session: ", session)

  // const { query = "", filter = "" } = await searchParams

  const { page, pageSize, query, filter } = await searchParams

  const { success, data, error } = await getQuestions({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query: query || "",
    filter: filter || "",
  })

  const { questions, isNext } = data || {}

  // const filteredQuestions = questions.filter((question) => {
  //   const matchesQuery = question.title
  //     .toLowerCase()
  //     .includes(query.toLowerCase());
  //   const matchesFilter = filter
  //     ? question.tags[0].name.toLowerCase() === filter.toLowerCase()
  //     : true;
  //   return matchesQuery && matchesFilter;
  // });

  return (
    <>
      <section className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>

        <Button className='primary-gradient min-h-[46px] px-4 py-3 !text-light-900'>
          <Link href={ROUTES.ASK_QUESTION}>Ask a Question</Link>
        </Button>
      </section>
      <section className='mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center'>
        <LocalSearch
          route='/'
          imgSrc='/icons/search.svg'
          placeholder='Search questions...'
          otherClasses='flex-1'
        />

        <CommonFilter 
          filters={HomePageFilters}
          otherClasses='min-h-[56px] sm:min-w-[170px]'
          containerClasses='hidden max-md:flex'
        />
      </section>
      <HomeFilter />
      <DataRenderer 
        success={success}
        data={questions}
        error={error}
        empty={EMPTY_QUESTION}
        render={(questions) => (
          <div className='mt-10 flex w-full flex-col gap-6'>
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        )}
      />

      <Pagination 
        page={page}
        isNext={isNext || false}
      />
    </>
  );
}

export default Home
