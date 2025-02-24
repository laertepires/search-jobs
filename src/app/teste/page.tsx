// import React from 'react'
// import { DehydratedState, QueryClient, dehydrate } from '@tanstack/react-query'
// import { fetchJobs, useJobs } from '@/hooks/useJobs'
// import { GetServerSideProps, InferGetServerSidePropsType } from 'next'

// function Teste({
//     dehydratedState,
//   }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    

//     const { data, isPending, isFetching } = useJobs(10, 10)
//     console.log("Teste => ", dehydratedState)
    
//     return (
//       <main>
//         <p>teste</p>
//       </main>
//     )
//   }

// export const getServerSideProps = (async () => {
  
//     const queryClient = new QueryClient();
//     await queryClient.prefetchQuery({
//       queryKey: ["jobs", 10],
//       queryFn: () => fetchJobs(10),
//     });

//     console.log("teste 123 => ", queryClient)
//   return {
//     props: {
//       dehydratedState: dehydrate(queryClient),
//     },
//   };
// }) satisfies GetServerSideProps<{
//   dehydratedState: DehydratedState;
// }>;

// export default Teste
// function usePosts(postCount: any): { data: any; isPending: any; isFetching: any } {
//     throw new Error('Function not implemented.')
// }

