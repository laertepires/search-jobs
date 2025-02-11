import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useEffect, useState } from "react";

type Repo = {
  name?: string;
  full_name?: string;
};

export const getServerSideProps = (async () => {
  const res = await fetch("https://api.github.com/repos/vercel/next.js");
  const repo = await res.json();
  return { props: { repo } };
}) satisfies GetServerSideProps<{
  repo: Repo;
}>;

export default function Server({
  repo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [data, setData] = useState<any>(0);
  useEffect(() => {
    setData(9)
    console.log("batata 1")
  }, [])

  console.log("batata 2")
  return (
    <div>
      <button onClick={() => setData(data + 1)}>clique me {data}</button>
    </div>
  );
}
