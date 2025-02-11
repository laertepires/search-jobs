import { GetStaticProps, InferGetStaticPropsType } from "next";
import { useState } from "react";

type Repo = {
  name: string;
  full_name: string;
};

export const getStaticProps = (async () => {
  const res = await fetch("https://api.github.com/repos/vercel/next.js");
  const repo = await res.json();
  return { props: { repo } };
}) satisfies GetStaticProps<{
  repo: Repo;
}>;

export default function Teste({
  repo,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const [data, setData] = useState<any>(0);
  console.log("data => ", data);
  return (
    <div>
      <button onClick={() => setData(data + 1)}>clique me {data}</button>
      {repo.full_name}
    </div>
  );
}
